import {
    Agent, AutoAcceptCredential, ConnectionEventTypes,
    ConnectionStateChangedEvent, DidExchangeState,
    HttpOutboundTransport,
    InitConfig,
    OutOfBandRecord,
    WsOutboundTransport
} from "@aries-framework/core";
import {agentDependencies, HttpInboundTransport} from "@aries-framework/node";
import {getGenesisTransaction} from "../routes/utils/apis";
import * as dotenv from "dotenv";

dotenv.config();

const initializeAgent = async () => {
    let genesisTransactionsBCovrinNet = await getGenesisTransaction(`${process.env.BCOVRIN_NET}`);
    const config: InitConfig = {
        label: 'issuer-agent',
        walletConfig: {
            id: 'PQ5gcrPJcmsRwcHugrf5pV',
            key: 'wallet_key_length_has_to_be_32__',
        },
        autoAcceptConnections: true,
        endpoints: ['http://localhost:3001'],
        publicDidSeed: 'WqLmDo/f2+MUamWoUXYLReswFBe8oPe6',
        indyLedgers: [
            {
                id: 'local_net',
                isProduction: false,
                indyNamespace: 'bcovrin:test',
                genesisTransactions: genesisTransactionsBCovrinNet,
            },
        ],
        autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
    }

    const agent = new Agent({ config: config, dependencies: agentDependencies })
    agent.registerOutboundTransport(new WsOutboundTransport())
    agent.registerOutboundTransport(new HttpOutboundTransport())
    agent.registerInboundTransport(new HttpInboundTransport({ port: 3001 }))
    await agent.initialize()

    return agent
}
export const IssuerAgent = initializeAgent();

export const createNewInvitation = async (agent: Agent) => {
    const outOfBandRecord = await agent.oob.createInvitation()
    return {
        invitationUrl: outOfBandRecord.outOfBandInvitation.toUrl({ domain: `${process.env.ISSUER_DOMAIN}` }),
        outOfBandRecord,
    }
}

export const setupConnectionListener = (
    issuer: Agent,
    outOfBandRecord: OutOfBandRecord,
    cb: (...args: any) => Promise<unknown>
) => {
    issuer.events.on<ConnectionStateChangedEvent>(
        ConnectionEventTypes.ConnectionStateChanged,
        async ({ payload }) => {
        if (payload.connectionRecord.outOfBandId !== outOfBandRecord.id) return
        if (payload.connectionRecord.state === DidExchangeState.Completed) {
            // the connection is now ready for usage in other protocols!
            console.log(`Connection for out-of-band id ${outOfBandRecord.id} completed`)

            // Custom business logic can be included here
            // In this example we can send a basic message to the connection, but
            // anything is possible
            await cb(payload.connectionRecord.id)
        }
    })
}