import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { EntriesService } from './entries.service.js';
import { CreateEntryDto } from './dto/create-entry.dto.js';
import { UpdateEntryDto } from './dto/update-entry.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';

@UseGuards(new AuthGuard())
@Controller('forms/:formId/entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Get()
  list(@Param('formId') formId: string) {
    return this.entriesService.listByForm(formId);
  }

  @Post()
  create(@Param('formId') formId: string, @Body() dto: CreateEntryDto) {
    return this.entriesService.create(formId, dto);
  }

  @Put(':entryId')
  update(@Param('entryId') entryId: string, @Body() dto: UpdateEntryDto) {
    return this.entriesService.update(entryId, dto);
  }

  @Delete(':entryId')
  remove(@Param('entryId') entryId: string) {
    return this.entriesService.remove(entryId);
  }
}