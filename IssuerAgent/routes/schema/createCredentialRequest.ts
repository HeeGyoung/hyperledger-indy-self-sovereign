import {IsArray, IsString} from "class-validator";
import {Trim} from "class-sanitizer";

export class CreateCredentialRequest {
    @IsArray()
    public attributes: Array<string> = [];
    @IsString()
    @Trim()
    public name: string = "";
    @IsString()
    @Trim()
    public version: string = "";
}