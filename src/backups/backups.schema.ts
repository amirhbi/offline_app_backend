import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BackupDocument = HydratedDocument<Backup>;

@Schema({ timestamps: true })
export class Backup {
  @Prop({ required: true })
  fileName!: string;

  @Prop({ required: true, default: 0 })
  sizeBytes!: number;

  @Prop({ type: String, default: '' })
  filePath?: string;

  @Prop({ type: String, default: 'ok' })
  status?: 'ok' | 'error';
}

export const BackupSchema = SchemaFactory.createForClass(Backup);
