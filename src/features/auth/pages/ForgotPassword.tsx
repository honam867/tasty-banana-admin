import { useState } from 'react';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import * as AuthApi from '@/features/auth/api/auth.api';

export default function ForgotPassword() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  async function onFinish(values: { email: string }) {
    setLoading(true);
    try {
      await AuthApi.requestPasswordReset(values);
      message.success('Password reset email sent');
      form.resetFields();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to send reset email';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ width: 420 }} bordered>
        <Typography.Title level={4}>Forgot Password</Typography.Title>
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item label="Email" name="email" rules={[{ required: true }, { type: 'email' }]}>
            <Input placeholder="you@example.com" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Send Reset Email
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

