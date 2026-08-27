import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class twoFactorAuthGuard extends AuthGuard('jwt-pre-auth') {}