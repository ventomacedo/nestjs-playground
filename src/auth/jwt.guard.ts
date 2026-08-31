import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwthGuard extends AuthGuard('jwt-full-auth') {}
