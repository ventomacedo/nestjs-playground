import { ApiProperty } from "@nestjs/swagger";

export class GetTimeResponseDto {
    @ApiProperty({ example: 'GTM-3', description: 'Timezone do horário enviado' })
    timezone!: string;

    @ApiProperty({ example: '1788184216055', description: 'O timestamp no momento da resposta' })
    timestamp!: number;
}