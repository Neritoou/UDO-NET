import { redirect } from 'next/navigation';
import { getCurrentUser } from '@module_1/auth/exports';
import { getUserNotifications } from '@module_4/notifications/exports';
import NotificationView from '@module_4/notifications/components/NotificationView';

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const notifications = await getUserNotifications(user.id, 50);

  return <NotificationView initialNotifications={notifications} />;
}