import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BackupScheduleDocument = HydratedDocument<BackupSchedule>;

type Frequency = 'daily' | 'weekly' | 'monthly';
type Weekday = 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

@Schema({ timestamps: true })
export class BackupSchedule {
  @Prop({ default: false })
  enabled!: boolean;

  @Prop({ type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' })
  frequency!: Frequency;

  @Prop({ type: String, enum: ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'], default: undefined })
  weekday?: Weekday;

  @Prop({ type: Number, default: undefined })
  monthday?: number; // 1..29

  @Prop({ type: String, default: '00:00' })
  time!: string; // HH:mm

  @Prop({ type: String, default: '' })
  lastRunDate?: string; // YYYY-MM-DD

  @Prop({ type: String, default: '' })
  lastRunTime?: string; // HH:mm
}

export const BackupScheduleSchema = SchemaFactory.createForClass(BackupSchedule);
