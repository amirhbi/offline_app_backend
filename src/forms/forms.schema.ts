import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FormDocument = HydratedDocument<Form>;

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'checkbox';

@Schema({ _id: false })
export class FormField {
  @Prop({ required: true })
  label!: string;

  @Prop({ required: true, enum: ['text', 'number', 'date', 'select', 'checkbox'] })
  type!: FieldType;

  @Prop({ default: false })
  required?: boolean;

  @Prop({ type: [String], default: undefined })
  options?: string[];
}

const FormFieldSchema = SchemaFactory.createForClass(FormField);

@Schema({ _id: false })
export class FormCategory {
  @Prop({ required: true })
  name!: string;

  @Prop({ type: [FormFieldSchema], default: [] })
  fields!: FormField[];
}

const FormCategorySchema = SchemaFactory.createForClass(FormCategory);

@Schema({ timestamps: true })
export class Form {
  @Prop({ required: true })
  name!: string;

  @Prop({ type: [FormFieldSchema], default: [] })
  fields!: FormField[];

  @Prop({ type: [FormCategorySchema], default: [] })
  categories?: FormCategory[];

  // Optional PDF export settings
  @Prop({ type: String, default: '' })
  pdfDescription?: string;

  @Prop({ type: String, default: '' })
  pdfImage?: string; // asset filename
}

export const FormSchema = SchemaFactory.createForClass(Form);