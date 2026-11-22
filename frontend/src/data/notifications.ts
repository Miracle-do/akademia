import { apiRequest } from './repo';

export interface AppNotification {
  id: string;
  kind: 'reminder' | 'content' | 'rank' | string;
  title: string;
  body: string;
  url: string;
  created_at: string;
  read_at: string | null;
}

export interface NotificationList {
  items: AppNotification[];
  unread: number;
}

export const NOTIFICATIONS_CHANGED_EVENT = 'akademia:notifications-changed';

export function fetchNotifications(): Promise<NotificationList> {
  return apiRequest<NotificationList>('/notifications');
}

export async function markNotificationsRead(ids?: string[]): Promise<void> {
  await apiRequest('/notifications/read', { method: 'POST', body: JSON.stringify({ ids }) });
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}
