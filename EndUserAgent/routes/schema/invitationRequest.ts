import {Trim} from "class-sanitizer";
import {IsString} from "class-validator";

export class InvitationRequest {
    @IsString()
    @Trim()
    public invitationUrl: string = "";
}