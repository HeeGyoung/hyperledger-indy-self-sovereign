import {ICredential} from "../model/credentialInterface";
import CredentialSchema from "../model/credentialSchema";

export default class CredentialService {
    public async createCredential(credential: ICredential) {
        const model = new CredentialSchema(credential);
        return await model.save()
    }

    public async getCredential(credentialId: string) {
        const credential = await CredentialSchema.findOne({credentialId: credentialId}).exec();
        return credential;
    }
}