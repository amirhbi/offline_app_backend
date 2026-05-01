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
    const sortOrder = order === 'desc' ? -1 : 1;
    const all = await this.entryModel.find({ formId }).sort({ createdAt: sortOrder }).lean();
    const withOrder = all.filter((e) => e.order != null).sort((a, b) => (a.order! - b.order!) * sortOrder);
    const withoutOrder = all.filter((e) => e.order == null);
    return [...withOrder, ...withoutOrder];
  }

  // Inserts entryId at targetOrder among all entries of the form and assigns
  // sequential orders (0, 1, 2, …) to every entry, including previously unordered ones.
  private async placeAndResequence(formId: any, entryId: string, targetOrder: number): Promise<void> {
    const all = await this.entryModel.find({ formId }).sort({ createdAt: 1 }).lean();

    // Current sorted list (excluding the entry being placed)
    const withOrder = all
      .filter((e) => e.order != null && String(e._id) !== entryId)
      .sort((a, b) => a.order! - b.order!);
    const withoutOrder = all.filter((e) => e.order == null && String(e._id) !== entryId);
    const sorted: { _id: any }[] = [...withOrder, ...withoutOrder];

    // targetOrder is 1-based; convert to 0-based index for splice
    const pos = Math.max(0, Math.min(targetOrder - 1, sorted.length));
    sorted.splice(pos, 0, { _id: entryId });

    await this.entryModel.bulkWrite(
      sorted.map((e, i) => ({
        updateOne: {
          filter: { _id: e._id as any },
          update: { $set: { order: i + 1 } },
        },
      })),
    );
  }

  // After a delete, close the gap by re-numbering all ordered entries sequentially.
  private async resequenceAfterRemove(formId: any): Promise<void> {
    const ordered = await this.entryModel
      .find({ formId, order: { $ne: null } })
      .sort({ order: 1 })
      .lean();
    if (!ordered.length) return;
    await this.entryModel.bulkWrite(
      ordered.map((e, i) => ({
        updateOne: {
          filter: { _id: e._id as any },
          update: { $set: { order: i + 1 } },
        },
      })),
    );
  }

  async create(formId: string, dto: CreateEntryDto, by?: { userId?: string; username?: string }): Promise<FormEntry> {
    const entry = new this.entryModel({ formId, data: dto.data || {} });
    const saved = await entry.save();

    if (dto.order != null) {
      await this.placeAndResequence(formId, String(saved._id), dto.order);
    }

    await this.logsService.create({
      userId: by?.userId,
      username: by?.username,
      action: 'entry_create',
      detail: `ایجاد رکورد ${formId}`,
    } as any);
    return saved;
  }

  async update(entryId: string, dto: UpdateEntryDto, by?: { userId?: string; username?: string }): Promise<FormEntry> {
    const current = await this.entryModel.findById(entryId).lean();
    if (!current) throw new NotFoundException('Entry not found');

    const newOrder = dto.order ?? null;

    // Update data (and order field) on the entry itself
    const updateOp: Record<string, any> = { $set: { data: dto.data || {} } };
    if (newOrder !== null) updateOp['$set']['order'] = newOrder;
    else updateOp['$unset'] = { order: '' };

    const res = await this.entryModel
      .findByIdAndUpdate(entryId, updateOp, { new: true, runValidators: true })
      .lean();
    if (!res) throw new NotFoundException('Entry not found');

    // Re-sequence all entries in the form to reflect the new position
    if (newOrder !== null) {
      await this.placeAndResequence(current.formId, entryId, newOrder);
    } else if (current.order != null) {
      // Order was removed — close the gap
      await this.resequenceAfterRemove(current.formId);
    }

    await this.logsService.create({
      userId: by?.userId,
      username: by?.username,
      action: 'entry_update',
      detail: `ویرایش رکورد ${entryId}`,
    } as any);
    return res as unknown as FormEntry;
  }

  async reorder(formId: string, ids: string[]): Promise<void> {
    await this.entryModel.bulkWrite(
      ids.map((id, index) => ({
        updateOne: {
          filter: { _id: id as any, formId },
          update: { $set: { order: index + 1 } },
        },
      })),
    );
  }

  async remove(entryId: string, by?: { userId?: string; username?: string }): Promise<void> {
    const res = await this.entryModel.findByIdAndDelete(entryId);
    if (!res) throw new NotFoundException('Entry not found');
    if (res.order != null) {
      await this.resequenceAfterRemove(res.formId);
    }
    await this.logsService.create({
      userId: by?.userId,
      username: by?.username,
      action: 'entry_delete',
      detail: `حذف رکورد ${entryId}`,
    } as any);
  }
}
