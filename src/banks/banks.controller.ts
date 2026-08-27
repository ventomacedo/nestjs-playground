import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { JwthGuard } from 'src/auth/jwt.guard';
import { BanksService } from './banks.service';


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
    async createBanks(@Body() body: any): Promise<any> {
        // return this.banksService
    }

    @UseGuards(JwthGuard)
    @Put('/')
    async updateBanks(@Body() body: any): Promise<any> {
        // return this.banksService
    }

    @UseGuards(JwthGuard)
    @Delete('/')
    async deleteBanks(@Body() body: any): Promise<any> {
        // return this.banksService
    }
}