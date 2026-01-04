import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { User, UserSchema } from './users.schema.js';
import { LogsModule } from '../logs/logs.module.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), LogsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
