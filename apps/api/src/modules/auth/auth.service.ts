import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async validateUser(email: string, password: string) {
    // Stubbed user validation
    if (email === 'eleve@example.com' && password === 'password') {
      return { id: 'student-1', role: 'ELEVE' };
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      return { success: false };
    }
    return {
      accessToken: 'stub-token',
      refreshToken: 'stub-refresh',
      user,
    };
  }
}
