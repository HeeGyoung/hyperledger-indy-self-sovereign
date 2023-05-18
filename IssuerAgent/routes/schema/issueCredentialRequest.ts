import {Trim} from "class-sanitizer";
import {IsArray, IsString} from "class-validator";

export class IssueCredentialRequest {
    @IsString()
    @Trim()
    public sendToUrl: string = "";
    @IsString()
    @Trim()
    public credentialId: string = "";
    @IsArray()
    public attributes: Array<object> = [];
}