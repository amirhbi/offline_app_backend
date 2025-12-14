import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FormEntry, FormEntryDocument } from './entries.schema.js';
import { CreateEntryDto } from './dto/create-entry.dto.js';

@Injectable()
export class EntriesService {
  constructor(
    @InjectModel(FormEntry.name) private readonly entryModel: Model<FormEntryDocument>,
  ) {}

  async listByForm(formId: string): Promise<FormEntry[]> {
    return this.entryModel.find({ formId }).sort({ createdAt: -1 }).lean();
  }

  async create(formId: string, dto: CreateEntryDto): Promise<FormEntry> {
    const entry = new this.entryModel({ formId, data: dto.data || {} });
    return entry.save();
  }

  async remove(entryId: string): Promise<void> {
    const res = await this.entryModel.findByIdAndDelete(entryId);
    if (!res) throw new NotFoundException('Entry not found');
  }
}