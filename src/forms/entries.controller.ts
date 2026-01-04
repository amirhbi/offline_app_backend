import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Query, Req } from '@nestjs/common';
import { EntriesService } from './entries.service.js';
import { CreateEntryDto } from './dto/create-entry.dto.js';
import { UpdateEntryDto } from './dto/update-entry.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { UsersService } from '../users/users.service.js';

@UseGuards(new AuthGuard())
@Controller('forms/:formId/entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService, private readonly usersService: UsersService) {}

  @Get()
  list(
    @Param('formId') formId: string,
    @Query('order') order?: 'asc' | 'desc',
  ) {
    return this.entriesService.listByForm(formId, order);
  }

  @Post()
  async create(@Param('formId') formId: string, @Body() dto: CreateEntryDto, @Req() req: any) {
    const payload = req?.user as { sub?: string } | undefined;
    const byUserId = payload?.sub;
    const user = byUserId ? await this.usersService.findOne(byUserId) : null;
    return this.entriesService.create(formId, dto, { userId: byUserId, username: user?.username });
  }

  @Put(':entryId')
  async update(@Param('entryId') entryId: string, @Body() dto: UpdateEntryDto, @Req() req: any) {
    const payload = req?.user as { sub?: string } | undefined;
    const byUserId = payload?.sub;
    const user = byUserId ? await this.usersService.findOne(byUserId) : null;
    return this.entriesService.update(entryId, dto, { userId: byUserId, username: user?.username });
  }

  @Delete(':entryId')
  async remove(@Param('entryId') entryId: string, @Req() req: any) {
    const payload = req?.user as { sub?: string } | undefined;
    const byUserId = payload?.sub;
    const user = byUserId ? await this.usersService.findOne(byUserId) : null;
    return this.entriesService.remove(entryId, { userId: byUserId, username: user?.username });
  }
}
