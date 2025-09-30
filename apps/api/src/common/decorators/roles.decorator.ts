import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type Role = 'ADMIN' | 'STAFF_VIE_SCOLAIRE' | 'PROF' | 'ELEVE' | 'PARENT';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
