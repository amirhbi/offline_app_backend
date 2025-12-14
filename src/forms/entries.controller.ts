import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { EntriesService } from './entries.service.js';
import { CreateEntryDto } from './dto/create-entry.dto.js';
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

  @Delete(':entryId')
  remove(@Param('entryId') entryId: string) {
    return this.entriesService.remove(entryId);
  }
}