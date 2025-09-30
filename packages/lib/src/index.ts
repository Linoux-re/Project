export type UserRole = 'ADMIN' | 'STAFF_VIE_SCOLAIRE' | 'PROF' | 'ELEVE' | 'PARENT';

export function formatName(firstName: string, lastName: string) {
  return `${firstName} ${lastName.toUpperCase()}`;
}

export function canAccess(role: UserRole, scope: string) {
  const permissions: Record<UserRole, string[]> = {
    ADMIN: ['*'],
    STAFF_VIE_SCOLAIRE: ['attendance.read', 'attendance.write'],
    PROF: ['homework.write', 'notes.write', 'attendance.read'],
    ELEVE: ['homework.read', 'notes.read'],
    PARENT: ['homework.read', 'attendance.read'],
  };
  const scopes = permissions[role] ?? [];
  return scopes.includes('*') || scopes.includes(scope);
}
