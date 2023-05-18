import {Express, Request, Response} from "express";
import {getCredential, issueCredential, registerCredentialDefinition, registerSchema} from "../credential/common";
import {createNewInvitation, IssuerAgent, setupConnectionListener} from "../connection/initialization";
import {plainToInstance} from "class-transformer";
import {CreateCredentialRequest} from "./schema/createCredentialRequest";
import CredentialService from "../service/credentials";
import {Agent} from "@aries-framework/core";
import {IssueCredentialRequest} from "./schema/issueCredentialRequest";
import {validate, ValidationError} from "class-validator";
import {request} from "./utils/apis";

interface IAttributes {
    [key: string]: any;
}

const issueDriverLicenceCredential =
    (issuer: Agent, credentialId: string, attributes: Array<Object>) => async (connectionId: string) => {
        const credentialDefinition = await getCredential(issuer, credentialId);
        console.log('Issuing the credential...')
        await issueCredential(
            issuer, credentialDefinition.id, connectionId,
            attributes.map((data: IAttributes) => {
                return {name: data["name"], value: data["value"]}
            })
        )
    }

export class CredentialRouter {
    private credentialService = new CredentialService();
    /**
     * @swagger
     *
     * /create/credential:
     *   post:
     *     tags:
     *       - "Credentials"
     *     summary: "Create a credential"
     *     description: Create a credential
     *     parameters:
     *       - in: body
     *         name: body
     *         description: Create a credential
     *         schema:
     *           type: object
     *           required:
     *             - attributes
     *             - name
     *             - version
     *           properties:
     *             attributes:
     *               type: array
     *               items:
     *                 type: string
     *             name:
     *               type: string
     *             version:
     *               type: string
     *           example:
     *             attributes: [name, issuedNumber, type]
     *             name: driver_licence
     *             version: 1.0
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Success
     */
    public routes(app: Express) {
        app.route('/create/credential')
            .post(async (req: Request, res: Response)=> {
                const createCredentialRequest = plainToInstance(CreateCredentialRequest, req.body);
                const issuer = await IssuerAgent;
                const schema = await registerSchema(issuer, {
                    attributes: createCredentialRequest.attributes,
                    name: createCredentialRequest.name,
                    version: createCredentialRequest.version,
                })

                const credentialDefinition = await registerCredentialDefinition(issuer, schema)
                const result = await this.credentialService.createCredential({
                    credentialId: credentialDefinition.id,
                    credentialName: createCredentialRequest.name,
                    version: createCredentialRequest.version,
                    schemaId: schema.id,
                    attributes: createCredentialRequest.attributes,
                });
                res.send(result);
            })
        /**
         * @swagger
         *
         * /credential/{id}:
         *   get:
         *     tags:
         *       - "Credentials"
         *     summary: "Get a credential by id"
         *     description: Return a credential
         *     parameters:
         *       - in: path
         *         name: id
         *         schema:
         *           type: string
         *         required: true
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: Successful retrieval
         */
        app.route('/credential/:id')
            .get(async (req: Request<{id: string}>, res: Response)=> {
                const result = this.credentialService.getCredential(req.params.id);
                res.json(await result);
            })

        /**
         * @swagger
         *
         * /send/credential:
         *   post:
         *     tags:
         *       - "Credentials"
         *     summary: "Send a credential"
         *     description: Send a credential"
         *     parameters:
         *       - in: body
         *         name: body
         *         description: Send invitation url
         *         schema:
         *           type: object
         *           required:
         *             - sendToUrl
         *             - credentialId
         *             - attributes
         *           properties:
         *             sendToUrl:
         *               type: string
         *             credentialId:
         *               type: string
         *             attributes:
         *               type: array
         *               items:
         *                 type: object
         *                 properties:
         *                   name:
         *                     type: string
         *                   value:
         *                     type: string
         *           example:
         *             sendToUrl: http://0.0.0.0:9999/receive/credential
         *             credentialId: LUCNH9kBtC1cawzf4UFaKW:3:CL:34:default
         *             attributes: [
         *               {"name": "name", "value": "Alice"},
         *               {"name": "issuedNumber", "value": "IssuedNumber123456789"},
         *               {"name": "type", "value": "G1"}
         *             ]
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: Success
         */
        app.route('/send/credential')
            .post(async (req: Request, res: Response)=> {
                const issueCredentialRequest = plainToInstance(IssueCredentialRequest, req.body);
                const validateError: ValidationError[] = await validate(issueCredentialRequest);
                if (validateError.length > 0) {
                    res.status(400).send(validateError[0].constraints);
                    return;
                }

                const issuer = await IssuerAgent;
                const { outOfBandRecord, invitationUrl } = await createNewInvitation(issuer);
                setupConnectionListener(
                    issuer, outOfBandRecord,
                    issueDriverLicenceCredential(issuer, issueCredentialRequest.credentialId, issueCredentialRequest.attributes));

                const result = await request(issueCredentialRequest.sendToUrl,
                    {
                        method: 'POST',
                        body: JSON.stringify({invitationUrl: invitationUrl}),
                        headers: {'Content-Type': 'application/json'}
                    }
                )
                res.send(result)
            })
    }
}