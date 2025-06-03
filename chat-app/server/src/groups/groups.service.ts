import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<GroupDocument> {
    const newGroup = new this.groupModel(createGroupDto);
    return newGroup.save();
  }

  async findAll(): Promise<GroupDocument[]> {
    return this.groupModel
      .find()
      .populate('admin', '-password')
      .populate('members', '-password')
      .exec();
  }

  async findById(id: string): Promise<GroupDocument> {
    const group = await this.groupModel
      .findById(id)
      .populate('admin', '-password')
      .populate('members', '-password')
      .exec();
      
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    
    return group;
  }

  async findByMember(userId: string): Promise<GroupDocument[]> {
    return this.groupModel
      .find({ members: userId })
      .populate('admin', '-password')
      .populate('members', '-password')
      .exec();
  }

  async addMember(groupId: string, userId: string): Promise<GroupDocument | null> {
    return this.groupModel
      .findByIdAndUpdate(
        groupId,
        { $addToSet: { members: userId } },
        { new: true },
      )
      .populate('admin', '-password')
      .populate('members', '-password')
      .exec();
  }

  async removeMember(groupId: string, userId: string): Promise<GroupDocument | null> {
    return this.groupModel
      .findByIdAndUpdate(
        groupId,
        { $pull: { members: userId } },
        { new: true },
      )
      .populate('admin', '-password')
      .populate('members', '-password')
      .exec();
  }
}
