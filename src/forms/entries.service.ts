import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FormEntry, FormEntryDocument } from './entries.schema.js';
import { CreateEntryDto } from './dto/create-entry.dto.js';
import { UpdateEntryDto } from './dto/update-entry.dto.js';
import { LogsService } from '../logs/logs.service.js';

@Injectable()
export class EntriesService {
  constructor(
    @InjectModel(FormEntry.name) private readonly entryModel: Model<FormEntryDocument>,
    private readonly logsService: LogsService,
  ) {}

  async listByForm(formId: string, order?: 'asc' | 'desc'): Promise<FormEntry[]> {
    const sortOrder = order === 'desc' ? -1 : 1; // default asc (newer at end)
    return this.entryModel.find({ formId }).sort({ createdAt: sortOrder }).lean();
  }

  async create(formId: string, dto: CreateEntryDto, by?: { userId?: string; username?: string }): Promise<FormEntry> {
    const entry = new this.entryModel({ formId, data: dto.data || {} });
    const saved = await entry.save();
    await this.logsService.create({
      userId: by?.userId,
      username: by?.username,
      action: 'entry_create',
      detail: `ایجاد رکورد ${formId}`,
    } as any);
    return saved;
  }

  async update(entryId: string, dto: UpdateEntryDto, by?: { userId?: string; username?: string }): Promise<FormEntry> {
    const res = await this.entryModel
      .findByIdAndUpdate(entryId, { $set: { data: dto.data || {} } }, { new: true, runValidators: true })
      .lean();
    if (!res) throw new NotFoundException('Entry not found');
    await this.logsService.create({
      userId: by?.userId,
      username: by?.username,
      action: 'entry_update',
      detail: `ویرایش رکورد ${entryId}`,
    } as any);
    return res as unknown as FormEntry;
  }

  async remove(entryId: string, by?: { userId?: string; username?: string }): Promise<void> {
    const res = await this.entryModel.findByIdAndDelete(entryId);
    if (!res) throw new NotFoundException('Entry not found');
    await this.logsService.create({
      userId: by?.userId,
      username: by?.username,
      action: 'entry_delete',
      detail: `حذف رکورد ${entryId}`,
    } as any);
  }
}
