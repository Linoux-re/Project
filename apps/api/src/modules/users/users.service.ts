import { Injectable } from '@nestjs/common';
import { Role } from '../../common/decorators/roles.decorator';

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
}

@Injectable()
export class UsersService {
  private readonly users: UserProfile[] = [
    { id: 'student-1', email: 'eleve@example.com', role: 'ELEVE', firstName: 'Alice', lastName: 'Durand' },
    { id: 'parent-1', email: 'parent@example.com', role: 'PARENT', firstName: 'Marc', lastName: 'Durand' },
    { id: 'prof-1', email: 'prof@example.com', role: 'PROF', firstName: 'Chloé', lastName: 'Martin' },
  ];

  findAll() {
    return this.users;
  }

  findById(id: string) {
    return this.users.find((user) => user.id === id);
  }
}
