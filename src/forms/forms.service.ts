import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Form, FormDocument } from './forms.schema.js';
import { CreateFormDto } from './dto/create-form.dto.js';
import { UpdateFormDto } from './dto/update-form.dto.js';
import { LogsService } from '../logs/logs.service.js';

@Injectable()
export class FormsService {
  constructor(
    @InjectModel(Form.name) private readonly formModel: Model<FormDocument>,
    private readonly logsService: LogsService,
  ) {}

  async findAll(): Promise<Form[]> {
    return this.formModel.find().sort({ orderPriority: 1, name: 1, updatedAt: -1 }).lean();
  }

  async findManyByIds(ids: string[]): Promise<Form[]> {
    return this.formModel
      .find({ _id: { $in: ids } })
      .sort({ orderPriority: 1, name: 1, updatedAt: -1 })
      .lean();
  }

  async findOne(id: string): Promise<Form | null> {
    return this.formModel.findById(id).lean();
  }

  async create(dto: CreateFormDto, by?: { userId?: string; username?: string }): Promise<Form> {
    const created = new this.formModel(dto);
    const saved = await created.save();
    await this.logsService.create({
      userId: by?.userId,
      username: by?.username,
      action: 'form_create',
      detail: `ایجاد فرم ${dto.name || ''}`,
    } as any);
    return saved;
  }

  async update(id: string, dto: UpdateFormDto, by?: { userId?: string; username?: string }): Promise<Form> {
    const updated = await this.formModel
      .findByIdAndUpdate(id, { ...dto }, { new: true, runValidators: true })
      .lean();
    if (!updated) throw new NotFoundException('Form not found');
    await this.logsService.create({
      userId: by?.userId,
      username: by?.username,
      action: 'form_update',
      detail: `ویرایش فرم ${dto.name || ''}`,
    } as any);
    return updated as unknown as Form;
  }

  async remove(id: string, by?: { userId?: string; username?: string }): Promise<void> {
    const res = await this.formModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Form not found');
    await this.logsService.create({
      userId: by?.userId,
      username: by?.username,
      action: 'form_delete',
      detail: `حذف فرم ${id}`,
    } as any);
  }
}
