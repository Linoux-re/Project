import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  getDashboardForRole(role: string) {
    return {
      role,
      widgets: [
        { type: 'nextCourse', title: 'Prochain cours', data: { subject: 'Mathématiques', start: new Date().toISOString() } },
        { type: 'homework', title: 'Devoirs à rendre', data: [{ id: '1', title: 'DM Physique', dueDate: new Date().toISOString() }] },
        { type: 'messages', title: 'Messages récents', data: [{ id: 'msg-1', subject: 'Réunion parents-profs' }] },
      ],
    };
  }
}
