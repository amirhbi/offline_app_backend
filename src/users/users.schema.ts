import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username!: string;

  @Prop({ default: '' })
  nickname?: string;

  @Prop({ required: true, enum: ['l2', 'l3', 'super_admin'], default: 'l2' })
  role!: 'l2' | 'l3' | 'super_admin';

  // Never select password by default; opt-in when needed
  @Prop({ select: false })
  password?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Form', default: [] })
  forms!: string[];

  @Prop({ type: [Types.ObjectId], ref: 'Form', default: [] })
  forms_view!: string[];

  @Prop({ type: [String], default: [] })
  reports!: string[];

  @Prop({ type: [String], default: [] })
  logs!: string[];

  @Prop({ default: false })
  backupAllowed?: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
