import { Card, Typography } from 'antd';
import { useAuth } from '@/app/providers/AuthProvider';

export default function Welcome() {
  const { user } = useAuth();
  return (
    <Card>
      <Typography.Title level={3}>Welcome back{user?.username ? `, ${user.username}` : user?.email ? `, ${user.email}` : ''}!</Typography.Title>
      <Typography.Paragraph>
        You are logged in as <strong>{user?.roles?.join(', ') || 'user'}</strong>.
      </Typography.Paragraph>
      <Typography.Paragraph>
        This is the admin dashboard welcome page. Use the sidebar to navigate.
      </Typography.Paragraph>
    </Card>
  );
}

