import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
 
export type LogDocument = HydratedDocument<Log>;
 
@Schema({ timestamps: true })
export class Log {
  @Prop({ type: Types.ObjectId, ref: 'User', default: undefined })
  userId?: string;
 
  @Prop({ type: String, default: '' })
  username?: string;
 
  @Prop({ type: String, required: true })
  action!: string;
 
  @Prop({ type: String, default: '' })
  detail?: string;
}
 
export const LogSchema = SchemaFactory.createForClass(Log);
