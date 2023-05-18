import {Agent} from "@aries-framework/core";
import {SchemaTemplate} from "@aries-framework/core/build/modules/ledger/services";
import {Schema} from "indy-sdk";

export const registerSchema = async (issuer: Agent, schema: SchemaTemplate) =>
    issuer.ledger.registerSchema(schema)

export const registerCredentialDefinition =  async (
    issuer: Agent, schema: Schema, tag: string='default'
)=>
    issuer.ledger.registerCredentialDefinition({ schema: schema, supportRevocation: false, tag: tag })

export const issueCredential = async (
    issuer: Agent, credentialDefinitionId: string, connectionId: string, attributes: Array<any>
) =>
    issuer.credentials.offerCredential({
        protocolVersion: 'v1',
        connectionId: connectionId,
        credentialFormats: {
            indy: {
                credentialDefinitionId: credentialDefinitionId,
                attributes: attributes,
            },
        },
    })

export const getCredential = async (issuer: Agent, credentialDefinitionId: string) =>
    issuer.ledger.getCredentialDefinition(credentialDefinitionId)
