import { useState } from 'react';
import { Button, Card, Form, Input, Typography, Alert, Checkbox } from 'antd';
import { useAuth } from '@/app/providers/AuthProvider';
import { getAppName } from '@/config';

export default function Login() {
  const { login, status } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const onFinish = async (values: { email: string; password: string; remember?: boolean }) => {
    setError(null);
    try {
      await login(values.email, values.password, !!values.remember);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Invalid credentials');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ width: 400 }} bordered>
        <Typography.Title level={3} style={{ textAlign: 'center' }}>
          {getAppName()}
        </Typography.Title>
        {error && (
          <Alert style={{ marginBottom: 16 }} type="error" message={error} showIcon />
        )}
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ remember: true }}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please input your email!' }, { type: 'email' }]}>
            <Input placeholder="admin@example.com" autoComplete="username" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
            <Input.Password placeholder="••••••••" autoComplete="current-password" />
          </Form.Item>
          <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={status === 'authenticating'}>
              Log In
            </Button>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="link" href="/forgot-password" block>
              Forgot password?
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
