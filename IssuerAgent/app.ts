import express, {Express} from "express";
import swaggerUi from 'swagger-ui-express';
import {swaggerSpec} from "./swagger";
import * as dotenv from 'dotenv';
import { InvitationRouter } from "./routes/invitations";
import * as mongoose from "mongoose";
import {CredentialRouter} from "./routes/credentials";

class App {
    public app: Express;
    public invitationRouter: InvitationRouter = new InvitationRouter();
    public credentialRouter: CredentialRouter = new CredentialRouter();

    constructor() {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: false}));
        this.app.use(
            "/api/docs",
            swaggerUi.serve,
            swaggerUi.setup(swaggerSpec)
        );
        dotenv.config();
        mongoose.connect(`${process.env.MONGODB_URL}`, {
            user: process.env.DB_USER,
            pass: process.env.DB_PASSWORD,
        })
        this.invitationRouter.routes(this.app);
        this.credentialRouter.routes(this.app);
    }
}

export default new App().app;
