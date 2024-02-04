import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/User.schema';
import { UserSettings } from 'src/schemas/UserSettings.schema';
import { CreateUserDTO, UpdateUserDTO } from './dto/User.dto';
import { Role } from 'src/schemas/Role.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserSettings.name)
    private userSettingModel: Model<UserSettings>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  getUsers() {
    return this.userModel.find().populate(['settings', 'posts', 'role']);
  }

  findOneByUsername(username: string) {
    const query = {};
    if (username) {
      query['username'] = username;
    }

    return this.userModel.findOne(query).populate(['role']);
  }

  async getUser(id: string) {
    return await (
      await this.userModel.findById(id)
    ).populate(['settings', 'posts', 'role']);
  }

  async createUser({ settings, ...dto }: CreateUserDTO) {
    if (settings) {
      const newSettings = new this.userSettingModel(settings);
      const newSavedSettings = await newSettings.save();

      const newUser = new this.userModel({
        ...dto,
        settings: newSavedSettings._id,
      });

      return newUser.save();
    }

    const newUser = new this.userModel({ ...dto });
    return newUser.save();
  }

  async updateUser(id: string, { settings, ...dto }: UpdateUserDTO) {
    if (settings) {
      const user = await this.userModel.findById(id);

      await this.userSettingModel.findByIdAndUpdate(user.settings, settings);

      return this.userModel.findByIdAndUpdate(id, dto, { new: true });
    }

    return this.userModel.findByIdAndUpdate(id, dto, { new: true });
  }

  deleteUser(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
}
