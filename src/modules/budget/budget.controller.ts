import { JwthGuard } from '@auth';
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from '@shared/decorators';
import { BudgetService } from './budget.service';

@Controller('budget')
export class BudgetController {
    constructor(private readonly budgetService: BudgetService) {}

    @UseGuards(JwthGuard)
    @Get('/balance')
    public async getBalance(@User() user: any) {
        return await this.budgetService.getBalance(user.userId);
    }

    //     private async updateBalance() {}

    //     @UseGuards(JwthGuard)
    //     @Post('/reserve')
    //     public async reservBalance() {}
}
