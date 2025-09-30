import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  it('returns widgets for a role', () => {
    const service = new DashboardService();
    const dashboard = service.getDashboardForRole('ELEVE');
    expect(dashboard.role).toBe('ELEVE');
    expect(Array.isArray(dashboard.widgets)).toBe(true);
  });
});
