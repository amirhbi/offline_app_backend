import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from './config.module.js';
import { FormsModule } from './forms/forms.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/offline_app',
    ),
    FormsModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}