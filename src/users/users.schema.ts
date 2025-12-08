import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username!: string;

  @Prop({ default: '' })
  nickname?: string;

  @Prop({ required: true, enum: ['admin', 'L3'], default: 'admin' })
  role!: 'admin' | 'L3';

  // Never select password by default; opt-in when needed
  @Prop({ select: false })
  password?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Form', default: [] })
  forms!: string[];

  @Prop({ type: [String], default: [] })
  reports!: string[];

  @Prop({ type: [String], default: [] })
  logs!: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);