import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';

export type FormEntryDocument = HydratedDocument<FormEntry>;

@Schema({ timestamps: true })
export class FormEntry {
  @Prop({ type: Types.ObjectId, ref: 'Form', required: true })
  formId!: string;

  // Flexible data payload keyed by field labels or names
  @Prop({ type: Map, of: MongooseSchema.Types.Mixed, default: {} })
  data!: Record<string, any>;
}

export const FormEntrySchema = SchemaFactory.createForClass(FormEntry);