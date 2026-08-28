import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { JwthGuard } from 'src/auth/jwt.guard';
import { BanksService } from './banks.service';
import { CreateBankRequestDto } from './dto/create-bank-request.dto';
import { TBanks, TNewBank } from 'src/database/schemas';
import { CreateBanksResponseDto } from './dto/create-bank-response.dto';
import { UpdateBanksResponseDto } from './dto/update-bank-response.dto';


@Controller('banks')
export class BanksController {
    constructor(private readonly banksService: BanksService) {}


    @UseGuards(JwthGuard)
    @Get('/')
    async getBanks(@Body() body: any): Promise<any> {
        return await this.banksService.getBanks();
    }

    @UseGuards(JwthGuard)
    @Get(`/:id`)
    async findBanksById(@Param('id') id: string): Promise<any> {
        return await this.banksService.findBankById(id);
    }

    @UseGuards(JwthGuard)
    @Post('/')
    async createBanks(@Body() body: CreateBankRequestDto): Promise<CreateBanksResponseDto> {
        return this.banksService.createBank(body);
    }

    @UseGuards(JwthGuard)
    @Put('/:id')
    async updateBanks(@Param('id') id: string, @Body() body: CreateBankRequestDto): Promise<UpdateBanksResponseDto> {
        return this.banksService.updateBank(body, id);
    }

    @UseGuards(JwthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Delete('/:id')
    async deleteBanks(@Param('id') id: string): Promise<void> {
        return this.banksService.deleteBank(id);
    }
}