import express, {Express} from "express";
import swaggerUi from 'swagger-ui-express';
import {swaggerSpec} from "./swagger";
import * as dotenv from 'dotenv';
import {
    Agent,
    AutoAcceptCredential,
    ConsoleLogger,
    HttpOutboundTransport,
    InitConfig,
    LogLevel,
    WsOutboundTransport
} from "@aries-framework/core";
import {agentDependencies, HttpInboundTransport} from "@aries-framework/node";
import fetch from 'node-fetch';
// import {initializeAgent, initializeHolderAgent} from "./connection/initialization";
import {InvitationRouter} from "./routes/invitations";

class App {
    public app: Express;
    // public enduserAgent: Promise<Agent>;
    // public holderAgent: Promise<Agent>;
    public invitationRouter: InvitationRouter = new InvitationRouter();

    constructor() {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: false}));
        this.app.use(
            "/api/docs",
            swaggerUi.serve,
            swaggerUi.setup(swaggerSpec)
        );
        this.invitationRouter.routes(this.app);
        // this.enduserAgent = initializeAgent();
        // this.holderAgent = initializeHolderAgent();
        dotenv.config();
    }
}

const newApp = new App();
export default {
    app: newApp.app,
    // enduserAgent: newApp.enduserAgent,
    // holderAgent: newApp.holderAgent,
}
