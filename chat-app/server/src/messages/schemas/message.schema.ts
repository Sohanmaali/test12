import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  sender: User;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  receiver: User;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Group' })
  group: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'User' }] })
  readBy: User[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
