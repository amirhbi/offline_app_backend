import { Controller, Get, Post, Req, UseGuards, ForbiddenException, Param, Res, NotFoundException, Delete, Body } from '@nestjs/common';
import { BackupsService } from './backups.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { UsersService } from '../users/users.service.js';
import * as fs from 'fs';
import * as path from 'path';
import type { Response } from 'express';

@UseGuards(new AuthGuard())
@Controller('backups')
export class BackupsController {
  constructor(
    private readonly backupsService: BackupsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  list() {
    return this.backupsService.list();
  }

  @Post()
  async create(@Req() req: any) {
    const payload = req?.user as { sub?: string; role?: string } | undefined;
    if (!payload) throw new ForbiddenException('Unauthorized');
    if (payload.role === 'super_admin') {
      return this.backupsService.createBackup();
    }
    if (payload.sub) {
      const user = await this.usersService.findOne(payload.sub);
      if (user?.backupAllowed) {
        return this.backupsService.createBackup();
      }
    }
    throw new ForbiddenException('Not allowed');
  }

  @Get('schedule')
  getSchedule() {
    return this.backupsService.getSchedule();
  }

  @Post('schedule')
  async setSchedule(@Req() req: any, @Body() body: any) {
    const payload = req?.user as { sub?: string; role?: string } | undefined;
    if (!payload) throw new ForbiddenException('Unauthorized');
    if (payload.role !== 'super_admin') {
      throw new ForbiddenException('Not allowed');
    }
    const { auto_backup_enabled, frequency, weekday, monthday, time } = body || {};
    // Basic validation
    const enabled = !!auto_backup_enabled;
    const freq = frequency === 'weekly' || frequency === 'monthly' ? frequency : 'daily';
    const wd = typeof weekday === 'string' ? weekday : undefined;
    const md = typeof monthday === 'number' ? monthday : undefined;
    const tm = typeof time === 'string' ? time : '00:00';
    return this.backupsService.saveSchedule({
      enabled,
      frequency: freq as any,
      weekday: wd as any,
      monthday: md,
      time: tm,
    } as any);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response, @Req() req: any) {
    const payload = req?.user as { sub?: string; role?: string } | undefined;
    if (!payload) throw new ForbiddenException('Unauthorized');
    if (payload.role !== 'super_admin') {
      if (payload.sub) {
        const user = await this.usersService.findOne(payload.sub);
        if (!user?.backupAllowed) throw new ForbiddenException('Not allowed');
      } else {
        throw new ForbiddenException('Not allowed');
      }
    }
    const b = await this.backupsService.findOne(id);
    if (!b || !b.filePath) throw new NotFoundException('Backup not found');
    const fp = path.resolve(b.filePath);
    if (!fs.existsSync(fp)) throw new NotFoundException('File not found');
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', `attachment; filename="${b.fileName}"`);
    const stream = fs.createReadStream(fp);
    stream.pipe(res);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const payload = req?.user as { sub?: string; role?: string } | undefined;
    if (!payload) throw new ForbiddenException('Unauthorized');
    if (payload.role !== 'super_admin') {
      if (payload.sub) {
        const user = await this.usersService.findOne(payload.sub);
        if (!user?.backupAllowed) throw new ForbiddenException('Not allowed');
      } else {
        throw new ForbiddenException('Not allowed');
      }
    }
    return this.backupsService.remove(id);
  }

  @Post(':id/restore')
  async restore(@Param('id') id: string, @Req() req: any) {
    const payload = req?.user as { sub?: string; role?: string } | undefined;
    if (!payload) throw new ForbiddenException('Unauthorized');
    if (payload.role !== 'super_admin') {
      throw new ForbiddenException('Not allowed');
    }
    return this.backupsService.restoreFromBackup(id);
  }
}
