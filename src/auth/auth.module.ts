import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { LogsModule } from '../logs/logs.module.js';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';

@Module({
  imports: [UsersModule, LogsModule],
  controllers: [AuthController],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
