import { Button, Card, Form, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as AuthApi from '@/features/auth/api/auth.api';

export default function ChangePassword() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onFinish(values: { currentPassword: string; newPassword: string; confirmPassword: string }) {
    setLoading(true);
    try {
      await AuthApi.changePassword(values);
      message.success('Password changed successfully');
      form.resetFields();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to change password';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ width: 480 }} bordered>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>Change Password</Typography.Title>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item label="Current Password" name="currentPassword" rules={[{ required: true, message: 'Current password is required' }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item label="New Password" name="newPassword" rules={[{ required: true, message: 'New password is required' }]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: 'Please confirm the new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('The two passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
