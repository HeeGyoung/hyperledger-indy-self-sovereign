import * as mongoose from "mongoose";

const Schema = mongoose.Schema;

const schema = new Schema({
    credentialId: String,
    credentialName: String,
    version: String,
    schemaId: String,
    attributes: Array<String>,
});

const CredentialSchema = mongoose.model('credentials', schema);
export default CredentialSchema;