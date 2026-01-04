import { Body, Controller, Get, Post, UseGuards, Query, ForbiddenException, Req } from '@nestjs/common';
import { LogsService } from './logs.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/users.schema.js';
 
@UseGuards(new AuthGuard())
@Controller('logs')
export class LogsController {
  constructor(
    private readonly logsService: LogsService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
 
  @Get()
  async list(@Query('limit') limit?: string, @Req() req?: any) {
    const payload = req?.user as { role?: string } | undefined;
    if (!payload || payload.role !== 'super_admin') {
      throw new ForbiddenException('Not allowed');
    }
    const n = limit ? Math.max(1, Math.min(1000, Number(limit))) : 200;
    return this.logsService.list(n);
  }

  @Post()
  async create(@Body() dto: { action: string; detail?: string }, @Req() req: any) {
    const payload = req?.user as { sub?: string; username?: string } | undefined;
    let username = payload?.username;
    if (!username && payload?.sub) {
      const user = await this.userModel.findById(payload.sub).select('username').lean();
      username = (user as any)?.username || undefined;
    }
    return this.logsService.create(
      {
        userId: payload?.sub,
        username,
        action: dto.action,
        detail: dto.detail || '',
      } as any,
    );
  }
}
