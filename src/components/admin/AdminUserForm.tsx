import { Form, Input, Select, Switch } from 'antd';
import type { FormInstance } from 'antd';
import type { AdminUser, UserRole } from '@/features/users/api/users.api';

export type AdminUserFormValues = {
  username: string;
  email: string;
  password?: string; // only used when creating
  role?: UserRole;
  status?: 'active' | 'inactive';
};

export default function AdminUserForm({ form, mode = 'create' }: { form: FormInstance<AdminUserFormValues>; mode?: 'create' | 'edit' }) {
  return (
    <Form layout="vertical" form={form}>
      <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Please enter username' }]}>
        <Input placeholder="johndoe" />
      </Form.Item>
      <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Please enter valid email' }]}>
        <Input placeholder="john@example.com" />
      </Form.Item>
      {mode === 'create' && (
        <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter password' }]}>
          <Input.Password placeholder="••••••••" />
        </Form.Item>
      )}
      <Form.Item label="Role" name="role" initialValue={'user'}>
        <Select
          options={[
            { value: 'user', label: 'User' },
            { value: 'admin', label: 'Admin' },
            { value: 'mod', label: 'Moderator' },
            { value: 'warehouse', label: 'Warehouse' },
            { value: 'owner', label: 'Owner' },
          ]}
        />
      </Form.Item>
      <Form.Item label="Active" name="status" valuePropName="checked" getValueProps={(v) => ({ checked: v !== 'inactive' })} getValueFromEvent={(checked) => (checked ? 'active' : 'inactive')}>
        <Switch />
      </Form.Item>
    </Form>
  );
}

