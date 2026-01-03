import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Backup, BackupSchema } from './backups.schema.js';
import { BackupsService } from './backups.service.js';
import { BackupsController } from './backups.controller.js';
import { User, UserSchema } from '../users/users.schema.js';
import { Form, FormSchema } from '../forms/forms.schema.js';
import { FormEntry, FormEntrySchema } from '../forms/entries.schema.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Backup.name, schema: BackupSchema },
      { name: User.name, schema: UserSchema },
      { name: Form.name, schema: FormSchema },
      { name: FormEntry.name, schema: FormEntrySchema },
    ]),
    UsersModule,
  ],
  controllers: [BackupsController],
  providers: [BackupsService],
})
export class BackupsModule {}
