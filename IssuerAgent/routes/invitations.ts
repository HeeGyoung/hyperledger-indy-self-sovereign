import {Express, Request, Response} from "express";
import {
    createNewInvitation, IssuerAgent, setupConnectionListener
} from "../connection/initialization";
import {InvitationRequest} from "./schema/invitationRequest";
import {plainToInstance} from "class-transformer";
import {validate, ValidationError} from "class-validator";
import {request} from "./utils/apis";

export class InvitationRouter {
    public routes(app: Express) {
        /**
         * @swagger
         *
         * /send/invitation:
         *   post:
         *     tags:
         *       - "Invitations"
         *     summary: "Send an invitation"
         *     description: Send an invitation
         *     parameters:
         *       - in: body
         *         name: body
         *         description: Send invitation url
         *         schema:
         *           type: object
         *           required:
         *             - sendToUrl
         *           properties:
         *             sendToUrl:
         *               type: string
         *           example:
         *             sendToUrl: http://0.0.0.0:9999/receive/invitation
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: Success
         */
        app.route('/send/invitation')
            .post(async (req: Request, res: Response)=> {
                const invitationRequest = plainToInstance(InvitationRequest, req.body);
                const validateError: ValidationError[] = await validate(invitationRequest);
                if (validateError.length > 0) {
                    res.status(400).send(validateError[0].constraints);
                    return;
                }

                console.log('Initializing Issuer agent...')
                const agent = await IssuerAgent;

                console.log('Creating the invitation as Issuer...')
                const { outOfBandRecord, invitationUrl } = await createNewInvitation(agent);

                console.log('Listening for connection changes...');
                setupConnectionListener(agent, outOfBandRecord, async () =>
                    console.log('We now have an active connection with user!!')
                );

                console.log(`Send invitation: ${invitationUrl}`);
                const result = await request(invitationRequest.sendToUrl,
                    {
                        method: 'POST',
                        body: JSON.stringify({invitationUrl: invitationUrl}),
                        headers: {'Content-Type': 'application/json'}
                    }
                )
                res.send(result);
            })
    }
}