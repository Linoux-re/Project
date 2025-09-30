import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
      return false;
    }
    // This is a stub guard. In a full implementation, JWT verification would happen here.
    const [, token] = request.headers.authorization.split(' ');
    request.user = token ? { id: 'demo-user', role: 'ELEVE' } : undefined;
    return Boolean(token);
  }
}
