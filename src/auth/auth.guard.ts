import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verifyJwt } from './jwt.util.js';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined;
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization');
    }
    const token = auth.slice('Bearer '.length);
    const payload = verifyJwt(token, process.env.JWT_SECRET || 'dev-secret');
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }
    // attach user info to request
    (req as any).user = payload;
    return true;
  }
}