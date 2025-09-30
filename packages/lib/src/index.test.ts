import { describe, expect, it } from 'vitest';
import { canAccess, formatName } from './index';

describe('formatName', () => {
  it('formats first and last name', () => {
    expect(formatName('Alice', 'Durand')).toBe('Alice DURAND');
  });
});

describe('canAccess', () => {
  it('allows admin to access everything', () => {
    expect(canAccess('ADMIN', 'anything')).toBe(true);
  });

  it('prevents student from writing notes', () => {
    expect(canAccess('ELEVE', 'notes.write')).toBe(false);
  });
});
