import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type GroupDocument = Group & Document;

@Schema({ timestamps: true })
export class Group {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  admin: User;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'User' }] })
  members: User[];

  @Prop({ default: '' })
  avatar: string;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
