import { ApiProperty } from '@nestjs/swagger';

export class RescuePasswordCodeResponseDto {
    @ApiProperty({ example: '123456' })
    code!: string;
}
