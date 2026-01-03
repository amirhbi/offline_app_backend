import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from './config.module.js';
import { FormsModule } from './forms/forms.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BackupsModule } from './backups/backups.module.js';
import * as dotenv from 'dotenv';

// Load environment variables BEFORE using process.env in module metadata
dotenv.config();

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/offline_app',
    ),
    FormsModule,
    UsersModule,
    AuthModule,
    BackupsModule,
  ],
})
export class AppModule {}
