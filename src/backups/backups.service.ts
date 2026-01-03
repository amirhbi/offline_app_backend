import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Backup } from './backups.schema.js';
import { User } from '../users/users.schema.js';
import { Form } from '../forms/forms.schema.js';
import { FormEntry } from '../forms/entries.schema.js';
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

@Injectable()
export class BackupsService {
  constructor(
    @InjectModel(Backup.name) private readonly backupModel: Model<Backup>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Form.name) private readonly formModel: Model<Form>,
    @InjectModel(FormEntry.name) private readonly entryModel: Model<FormEntry>,
  ) {}

  async list(): Promise<Backup[]> {
    return this.backupModel.find().sort({ createdAt: -1 }).lean().exec() as any;
  }

  async findOne(id: string): Promise<Backup | null> {
    const doc = await this.backupModel.findById(id).lean().exec();
    return (doc as any) || null;
  }

  async remove(id: string): Promise<{ ok: boolean }> {
    const doc = await this.backupModel.findById(id).lean().exec();
    if (doc?.filePath) {
      try {
        const fp = path.resolve(doc.filePath);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      } catch {}
    }
    await this.backupModel.deleteOne({ _id: id }).exec();
    return { ok: true };
  }

  async createBackup(): Promise<Backup> {
    const users = await (this.userModel.find().lean().exec() as any);
    const forms = await (this.formModel.find().lean().exec() as any);
    const entries = await (this.entryModel.find().lean().exec() as any);

    const payload = { users, forms, entries };
    const json = JSON.stringify(payload);

    const dir = path.resolve(process.cwd(), 'backups');
    fs.mkdirSync(dir, { recursive: true });

    const stamp = new Date();
    const namePart = `${stamp.getFullYear()}-${String(stamp.getMonth() + 1).padStart(2, '0')}-${String(stamp.getDate()).padStart(2, '0')}_${String(stamp.getHours()).padStart(2, '0')}-${String(stamp.getMinutes()).padStart(2, '0')}-${String(stamp.getSeconds()).padStart(2, '0')}`;
    const fileName = `backup_full_${namePart}.json.gz`;
    const filePath = path.join(dir, fileName);

    const gz = zlib.gzipSync(Buffer.from(json, 'utf8'));
    fs.writeFileSync(filePath, gz);
    const sizeBytes = gz.byteLength;

    const rec = await this.backupModel.create({
      fileName,
      sizeBytes,
      filePath,
      status: 'ok',
    });
    return rec.toObject() as any;
  }
}
