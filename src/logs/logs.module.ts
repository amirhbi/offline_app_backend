import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogSchema } from './logs.schema.js';
import { LogsService } from './logs.service.js';
import { LogsController } from './logs.controller.js';
import { User, UserSchema } from '../users/users.schema.js';
 
@Module({
  imports: [MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }, { name: User.name, schema: UserSchema }])],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
