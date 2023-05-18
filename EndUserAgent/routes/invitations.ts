import {Express, Request, Response} from "express";
import {plainToInstance} from "class-transformer";
import {InvitationRequest} from "./schema/invitationRequest";
import {validate, ValidationError} from "class-validator";
import {HolderAgent, receiveInvitation, setupCredentialListener} from "../connection/initialization";

export class InvitationRouter {
    public routes(app: Express) {
        /**
         * @swagger
         *
         * /receive/invitation:
         *   post:
         *     tags:
         *       - "Invitations"
         *     summary: "Receive an invitation"
         *     description: Receive an invitation
         *     parameters:
         *       - in: body
         *         name: body
         *         description: Receive invitation url
         *         schema:
         *           type: object
         *           required:
         *             - invitationUrl
         *           properties:
         *             invitationUrl:
         *               type: string
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: Success
         */
        app.route('/receive/invitation')
            .post(async (req: Request, res: Response)=> {
                const invitationRequest = plainToInstance(InvitationRequest, req.body);
                const validateError: ValidationError[] = await validate(invitationRequest);
                if (validateError.length > 0) {
                    res.status(400).send(validateError[0].constraints);
                    return;
                }
                const agent = await HolderAgent;
                console.log('Accepting the invitation as Enduser...')
                await receiveInvitation(agent, invitationRequest.invitationUrl);
                res.send({"message": "Enduser receives the invitation!"});
            })

        /**
         * @swagger
         *
         * /receive/credential:
         *   post:
         *     tags:
         *       - "Invitations"
         *     summary: "Receive an invitation"
         *     description: Receive an invitation
         *     parameters:
         *       - in: body
         *         name: body
         *         description: Receive invitation url
         *         schema:
         *           type: object
         *           required:
         *             - invitationUrl
         *           properties:
         *             invitationUrl:
         *               type: string
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: Success
         */
        app.route('/receive/credential')
            .post(async (req: Request, res: Response)=> {
                const invitationRequest = plainToInstance(InvitationRequest, req.body);
                const validateError: ValidationError[] = await validate(invitationRequest);
                if (validateError.length > 0) {
                    res.status(400).send(validateError[0].constraints);
                    return;
                }
                const holder = await HolderAgent;

                console.log('Initializing the credential listener...')
                setupCredentialListener(holder);

                console.log('Accepting the invitation of credential as Enduser...')
                console.log(invitationRequest.invitationUrl)
                await receiveInvitation(holder, invitationRequest.invitationUrl);
                res.send({"message": "Enduser receives the credential!"});
            })

    }
}