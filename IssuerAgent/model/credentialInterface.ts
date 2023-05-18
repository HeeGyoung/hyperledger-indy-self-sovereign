export interface ICredential {
    _id?: String;
    credentialId: String,
    credentialName: String,
    version: String,
    schemaId: String,
    attributes: Array<String>,
}