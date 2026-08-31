import { ApiProperty } from '@nestjs/swagger';

export class CreateBanksResponseDto {
    @ApiProperty({
        example: '01a045ac-fe61-762c-a86f-020c2c54cd2c',
        description: 'CNPJ (alfanumérico)',
    })
    id!: string;

    @ApiProperty({
        example: 'GXHTTL9C000198',
        description: 'CNPJ (alfanumérico)',
    })
    taxId!: string;

    @ApiProperty({
        example: 'Monopoly Bank',
        description: 'Razão Social da instituição',
    })
    name!: string;

    @ApiProperty({
        example: 'Banco imobiliário',
        description: 'Nome Fantasia da instituição',
    })
    fantasyName!: string;

    @ApiProperty({
        example: '001',
        description: 'Identificador do Sistema de Pagamneto Brasileiro',
    })
    ispb!: string | null;

    @ApiProperty({
        example: '00000001',
        description:
            'Código do Sistema de Compensação de Cheques e Outros Papeis',
    })
    compeCode!: string;

    @ApiProperty({ example: '2026-08-27T23:57:48.905Z' })
    createdAt!: Date;

    @ApiProperty({ example: '2026-08-27T23:57:48.905Z' })
    updatedAt!: Date | null;

    @ApiProperty({ example: '2026-08-27T23:57:48.905Z' })
    deletedAt!: Date | null;
}
