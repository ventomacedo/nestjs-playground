import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DoneTrasactionRequestDto {
    @ApiProperty({
        example: 'uuid-v7-gerado-no-front-112233',
        description:
            'UUIDv7 gerado pelo frontend para assegurar que a transação é rastreável',
    })
    @IsNotEmpty({ message: 'transactionId é obrigatório ' })
    transactionId!: string;

    @ApiProperty({
        example: 'ORDER-TYPE-0000',
        description: 'ID do pedido gerado pelo sitema de e-commerce',
    })
    @IsNotEmpty({ message: 'orderId é obrigatório' })
    orderId!: string;

    @ApiProperty({
        example: 1,
        description: 'Versão do saldo disponível no endpoint /balance',
    })
    @IsNotEmpty({ message: 'version é obrigatório' })
    version!: number;
}
