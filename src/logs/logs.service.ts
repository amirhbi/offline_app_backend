import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log } from './logs.schema.js';
 
@Injectable()
export class LogsService {
  constructor(@InjectModel(Log.name) private readonly logModel: Model<Log>) {}
 
  async list(limit = 200): Promise<Log[]> {
    const docs = await this.logModel.find().sort({ createdAt: -1 }).limit(limit).lean().exec();
    return docs as any;
  }
 
  async create(evt: { userId?: string; username?: string; action: string; detail?: string }): Promise<Log> {
    const created = await this.logModel.create({
      userId: evt.userId,
      username: evt.username,
      action: evt.action,
      detail: evt.detail,
    } as any);
    return created.toObject() as any;
  }
}
