import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Backup } from './backups.schema.js';
import { BackupSchedule } from './schedule.schema.js';
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
    @InjectModel(BackupSchedule.name) private readonly scheduleModel: Model<BackupSchedule>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Form.name) private readonly formModel: Model<Form>,
    @InjectModel(FormEntry.name) private readonly entryModel: Model<FormEntry>,
  ) {
    this.initScheduler();
  }

  async list(): Promise<Backup[]> {
    return this.backupModel.find().sort({ createdAt: -1 }).lean().exec() as any;
  }

  async findOne(id: string): Promise<Backup | null> {
    const doc = await this.backupModel.findById(id).lean().exec();
    return (doc as any) || null;
  }

  async getSchedule(): Promise<BackupSchedule | null> {
    const doc = await this.scheduleModel.findOne().lean().exec();
    return (doc as any) || null;
  }

  async saveSchedule(data: Partial<BackupSchedule>): Promise<BackupSchedule> {
    const cur = await this.scheduleModel.findOne().exec();
    if (!cur) {
      const created = await this.scheduleModel.create({
        enabled: !!data.enabled,
        frequency: (data.frequency as any) ?? 'daily',
        weekday: data.weekday as any,
        monthday: (data.monthday as any) ?? undefined,
        time: (data.time as any) ?? '00:00',
        lastRunDate: '',
        lastRunTime: '',
      } as any);
      return created.toObject() as any;
    }
    if (typeof data.enabled === 'boolean') cur.enabled = data.enabled;
    if (data.frequency) cur.frequency = data.frequency as any;
    if (typeof data.weekday === 'string') cur.weekday = data.weekday as any;
    if (typeof data.monthday === 'number') cur.monthday = data.monthday;
    if (typeof data.time === 'string') cur.time = data.time;
    if (typeof (data as any).lastRunDate === 'string') cur.lastRunDate = (data as any).lastRunDate;
    if (typeof (data as any).lastRunTime === 'string') cur.lastRunTime = (data as any).lastRunTime;
    await cur.save();
    return cur.toObject() as any;
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

  private scheduleInitialized = false;
  private initScheduler() {
    if (this.scheduleInitialized) return;
    this.scheduleInitialized = true;
    setInterval(async () => {
      try {
        const s = await this.getSchedule();
        if (!s || !s.enabled) return;
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const curTime = `${hh}:${mm}`;
        let shouldRun = false;
        if (s.frequency === 'daily') {
          shouldRun = curTime === s.time;
        } else if (s.frequency === 'weekly') {
          const map: Record<number, string> = { 0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat' };
          const wd = map[now.getDay()];
          shouldRun = curTime === s.time && s.weekday === wd;
        } else if (s.frequency === 'monthly') {
          const dom = now.getDate();
          shouldRun = curTime === s.time && s.monthday === dom;
        }
        const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        if (shouldRun) {
          if (s.lastRunDate === dateKey && s.lastRunTime === curTime) return;
          await this.createBackup();
          await this.saveSchedule({ lastRunDate: dateKey, lastRunTime: curTime } as any);
        }
      } catch {}
    }, 30000);
  }
}
