import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { verifyPassword } from './password.util.js';
import { signJwt } from './jwt.util.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.usersService.findByUsername(dto.username);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = verifyPassword(dto.password, user.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = signJwt(
      { sub: (user as any)._id?.toString?.() || (user as any).id, role: user.role },
      process.env.JWT_SECRET || 'dev-secret',
      60 * 24 * 60 * 60,
    );
    return { token, role: user.role, userData: { role: user.role, username: user.username, nickname: user.nickname, forms: user.forms, forms_view: user.forms_view, reports: user.reports, logs: user.logs, backupAllowed: user.backupAllowed }};
  }
}