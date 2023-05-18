import {
    Agent,
    AutoAcceptCredential, CredentialEventTypes, CredentialState, CredentialStateChangedEvent,
    HttpOutboundTransport,
    InitConfig,
    WsOutboundTransport
} from "@aries-framework/core";
import {agentDependencies, HttpInboundTransport} from "@aries-framework/node";
import {getGenesisTransaction, request} from "../routes/utils/apis";
import * as dotenv from 'dotenv';

dotenv.config();

const initializeAgent = async () => {
    let genesisTransactionsBCovrinNet = await getGenesisTransaction(`${process.env.BCOVRIN_NET}`)
    const config: InitConfig = {
        label: 'end-user-agent',
        walletConfig: {
            id: 'EndUser',
            key: 'enduseragent00000000000000000000',
        },
        autoAcceptConnections: true,
        indyLedgers: [
            {
                id: 'local_net',
                isProduction: false,
                indyNamespace: 'bcovrin:test',
                genesisTransactions: genesisTransactionsBCovrinNet,
            },
        ],
        autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
        endpoints: ['http://localhost:3002']
    }

    const agent = new Agent({
        config: config,
        dependencies: agentDependencies
    })
    agent.registerOutboundTransport(new WsOutboundTransport())
    agent.registerOutboundTransport(new HttpOutboundTransport())
    agent.registerInboundTransport(new HttpInboundTransport({ port: 3002 }))
    await agent.initialize()

    return agent
}
export const HolderAgent = initializeAgent();

export const receiveInvitation = async (agent: Agent, invitationUrl: string) => {
    const { outOfBandRecord } = await agent.oob.receiveInvitationFromUrl(invitationUrl)
    return outOfBandRecord
}

export const setupCredentialListener = (holder: Agent) => {
    holder.events.on<CredentialStateChangedEvent>(CredentialEventTypes.CredentialStateChanged, async ({ payload }) => {
        switch (payload.credentialRecord.state) {
            case CredentialState.OfferReceived:
                console.log('Received a credential')
                // custom logic here
                const accepted = await holder.credentials.acceptOffer({ credentialRecordId: payload.credentialRecord.id })
                console.log('Credential is...')
                console.log(accepted.credentialAttributes)
            case CredentialState.Done:
                console.log(`Credential for credential id ${payload.credentialRecord.id} is accepted`)
                // For demo purposes we exit the program here.
                // process.exit(0)
        }
    })
}