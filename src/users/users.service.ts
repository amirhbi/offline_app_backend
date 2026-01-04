import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { hashPassword } from '../auth/password.util.js';
import { LogsService } from '../logs/logs.service.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly logsService: LogsService,
  ) {}

  async findAll(role?: 'l2' | 'l3'): Promise<User[]> {
    const query: Record<string, unknown> = {};
    if (role) query.role = role;
    return this.userModel
      .find(query)
      .select('-password')
      .sort({ updatedAt: -1 })
      .lean();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).select('-password').lean();
  }

  async create(dto: CreateUserDto): Promise<User> {
    const toCreate: Partial<User> = { ...dto };
    if (dto.password && dto.password.trim().length > 0) {
      toCreate.password = hashPassword(dto.password);
    }
    const created = await new this.userModel(toCreate).save();
    // Re-read without password for response
    const sanitized = await this.userModel
      .findById(created._id)
      .select('-password')
      .lean();
    await this.logsService.create({
      userId: (created as any)._id?.toString?.(),
      username: (sanitized as any)?.username,
      action: 'user_create',
      detail: 'ایجاد کاربر',
    });
    return sanitized as unknown as User;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const updatePayload: Record<string, unknown> = { ...dto };
    if (typeof dto.password === 'string' && dto.password.trim().length > 0) {
      updatePayload.password = hashPassword(dto.password);
    } else {
      // Ensure we don't blank out password when omitted
      delete updatePayload.password;
    }
    const updated = await this.userModel
      .findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true })
      .select('-password')
      .lean();
    if (!updated) throw new NotFoundException('User not found');
    await this.logsService.create({
      userId: (updated as any)?._id?.toString?.() || id,
      username: (updated as any)?.username,
      action: 'user_update',
      detail: `ویرایش فیلدها: ${Object.keys(dto).join(', ')}`,
    });
    return updated as unknown as User;
  }

  async remove(id: string): Promise<void> {
    const res = await this.userModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('User not found');
    await this.logsService.create({
      userId: (res as any)?._id?.toString?.() || id,
      username: (res as any)?.username,
      action: 'user_delete',
      detail: 'حذف کاربر',
    });
  }

  async findByUsername(username: string): Promise<(User & { password?: string }) | null> {
    // Opt-in to password for authentication use cases
    return this.userModel.findOne({ username }).select('+password').lean();
  }
}
