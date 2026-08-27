import { ApiProperty } from "@nestjs/swagger";

export class LoginResponseDto {
    @ApiProperty({ 
        example: { twoFactorAuthToken: 'xxxxx.yyyyy.zzzzz' },
        description: 'Retorna um authToken temporário somente para a validação do 2FA'
    })
    twoFactorAuthToken!: string;
    
    @ApiProperty({ 
        example: { authChallenge: 'xxxxx.yyyyy.zzzzz' },
        description: 'Retorna qual é o próximo passo para o 2FA. MFA_VALIDATE = "Validar o código do authenticator do usuário". MFA_SYNC = "Sincronizar o authenticator do usuário com o usuário dele."'
    })
    authChallenge!: 'MFA_VALIDATE' | 'MFA_SYNC';
}