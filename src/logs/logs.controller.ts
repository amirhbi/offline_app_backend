import { Controller, Get, UseGuards, Query, ForbiddenException, Req } from '@nestjs/common';
import { LogsService } from './logs.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
 
@UseGuards(new AuthGuard())
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}
 
  @Get()
  async list(@Query('limit') limit?: string, @Req() req?: any) {
    const payload = req?.user as { role?: string } | undefined;
    if (!payload || payload.role !== 'super_admin') {
      throw new ForbiddenException('Not allowed');
    }
    const n = limit ? Math.max(1, Math.min(1000, Number(limit))) : 200;
    return this.logsService.list(n);
  }
}
