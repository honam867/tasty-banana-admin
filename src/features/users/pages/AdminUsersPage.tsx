import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Drawer, Form, Input, InputNumber, Modal, Popconfirm, Row, Col, Select, Space, Switch, Tag, Typography, message, Divider, Descriptions, List } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined, LockOutlined, UnlockOutlined, DollarCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import PageContainer from '@/components/PageContainer';
import * as UsersApi from '@/features/users/api/users.api';
import AdminUserForm, { AdminUserFormValues } from '@/components/admin/AdminUserForm';
import { AdminTable, ActionIconButton } from '@/components/admin/AdminTable';
import dayjs from 'dayjs';

type AdminUser = UsersApi.AdminUser;

const formatDateTime = (value?: string) => (value ? dayjs(value).format('DD-MM-YYYY HH:mm') : '-');

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState<string>('');
  const [role, setRole] = useState<UsersApi.UserRole | undefined>(undefined);
  const [status, setStatus] = useState<UsersApi.UserStatus | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(undefined);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [creditOpen, setCreditOpen] = useState(false);
  const [debitOpen, setDebitOpen] = useState(false);
  const [current, setCurrent] = useState<AdminUser | null>(null);

  const [createForm] = Form.useForm<AdminUserFormValues>();
  const [editForm] = Form.useForm<AdminUserFormValues>();
  const [creditForm] = Form.useForm<{ amount: number; reason?: string; notes?: string; idempotencyKey?: string }>();
  const [debitForm] = Form.useForm<{ amount: number; reason?: string; notes?: string; idempotencyKey?: string }>();
  const [historyVersion, setHistoryVersion] = useState(0);

  async function fetchList() {
    setLoading(true);
    try {
      const res = await UsersApi.listUsers({ page, limit, search: search || undefined, role, status, sortBy, sortOrder });
      setItems(res.items);
      setTotal(res.total);
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, role, status, sortBy, sortOrder]);

  const columns: ColumnsType<AdminUser> = [
    { title: 'Username', dataIndex: 'username', key: 'username', sorter: true },
    { title: 'Email', dataIndex: 'email', key: 'email', sorter: true },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'User', value: 'user' },
        { text: 'Moderator', value: 'mod' },
        { text: 'Warehouse', value: 'warehouse' },
        { text: 'Owner', value: 'owner' },
      ],
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
      ],
      render: (v: UsersApi.UserStatus) => (v === 'active' ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>),
    },
    {
      title: 'Tokens',
      dataIndex: 'tokenBalance',
      key: 'tokenBalance',
      width: 120,
      render: (v?: number) => (
        <Space>
          <DollarCircleOutlined style={{ color: '#faad14' }} />
          <span>{typeof v === 'number' ? v : 0}</span>
        </Space>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (value?: string) => formatDateTime(value),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <ActionIconButton
            title="View details"
            icon={<EyeOutlined />}
            color="#1677ff"
            onClick={() => openDetails(record)}
          />
          <ActionIconButton
            title="Edit user"
            icon={<EditOutlined />}
            color="#faad14"
            onClick={() => openEdit(record)}
          />
          {record.status === 'active' ? (
            <ActionIconButton
              title="Deactivate user"
              icon={<LockOutlined />}
              color="#ff7875"
              onClick={() => changeStatus(record, 'inactive')}
            />
          ) : (
            <ActionIconButton
              title="Activate user"
              icon={<UnlockOutlined />}
              color="#52c41a"
              onClick={() => changeStatus(record, 'active')}
            />
          )}
          <Popconfirm
            title="Delete user?"
            description="Soft delete by default"
            onConfirm={() => removeUser(record)}
            okText="Delete"
            placement="top"
          >
            <div>
              <ActionIconButton title="Delete user" icon={<DeleteOutlined />} danger />
            </div>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  function handleTableChange(pagination: any, filters: any, sorter: any) {
    setPage(pagination.current || 1);
    setLimit(pagination.pageSize || 10);
    const r = filters?.role?.[0] as UsersApi.UserRole | undefined;
    const s = filters?.status?.[0] as UsersApi.UserStatus | undefined;
    setRole(r);
    setStatus(s);
    if (sorter?.order) {
      setSortBy(sorter.field);
      setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
    } else {
      setSortBy(undefined);
      setSortOrder(undefined);
    }
  }

  function openCreate() {
    createForm.resetFields();
    setCreateOpen(true);
  }

  function openEdit(record: AdminUser) {
    setCurrent(record);
    editForm.setFieldsValue({
      username: record.username,
      email: record.email,
      role: record.role,
      status: record.status,
    });
    setEditOpen(true);
  }

  async function openDetails(record: AdminUser) {
    try {
      const [detail, balance] = await Promise.allSettled([
        UsersApi.getUser(record.id),
        UsersApi.getTokenBalance(record.id),
      ]);
      const detailVal = detail.status === 'fulfilled' ? detail.value : {} as any;
      const balanceVal = balance.status === 'fulfilled' ? balance.value?.balance : record.tokenBalance;
      setCurrent({ ...record, ...detailVal, tokenBalance: balanceVal });
      setDetailOpen(true);
    } catch (e: any) {
      setCurrent(record);
      setDetailOpen(true);
    }
  }

  async function changeStatus(record: AdminUser, next: UsersApi.UserStatus) {
    try {
      await UsersApi.updateUserStatus(record.id, { status: next });
      message.success('Status updated');
      fetchList();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to update status');
    }
  }

  async function removeUser(record: AdminUser) {
    try {
      await UsersApi.deleteUser(record.id, { permanent: false });
      message.success('User deleted');
      fetchList();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Delete failed');
    }
  }

  async function onCreateSubmit() {
    const values = await createForm.validateFields();
    try {
      await UsersApi.createUser({
        username: values.username,
        email: values.email,
        password: values.password!,
        role: values.role,
        status: values.status,
      });
      message.success('User created');
      setCreateOpen(false);
      fetchList();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Create failed');
    }
  }

  async function onEditSubmit() {
    if (!current) return;
    const values = await editForm.validateFields();
    try {
      await UsersApi.updateUser(current.id, {
        username: values.username,
        email: values.email,
        role: values.role,
        status: values.status,
      });
      message.success('User updated');
      setEditOpen(false);
      fetchList();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Update failed');
    }
  }

  function openCredit() {
    creditForm.resetFields();
    creditForm.setFieldsValue({ idempotencyKey: crypto.randomUUID?.() ?? String(Date.now()) });
    setCreditOpen(true);
  }
  function openDebit() {
    debitForm.resetFields();
    debitForm.setFieldsValue({ idempotencyKey: crypto.randomUUID?.() ?? String(Date.now()) });
    setDebitOpen(true);
  }

  async function submitCredit() {
    if (!current) return;
    const v = await creditForm.validateFields();
    try {
      await UsersApi.creditTokens(current.id, v);
      const balance = await UsersApi.getTokenBalance(current.id);
      setCurrent((prev) => (prev ? { ...prev, tokenBalance: balance.balance } : prev));
      setHistoryVersion((ver) => ver + 1);
      message.success('Credited');
      setCreditOpen(false);
      await fetchList();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Credit failed');
    }
  }

  async function submitDebit() {
    if (!current) return;
    const v = await debitForm.validateFields();
    try {
      await UsersApi.debitTokens(current.id, v);
      const balance = await UsersApi.getTokenBalance(current.id);
      setCurrent((prev) => (prev ? { ...prev, tokenBalance: balance.balance } : prev));
      setHistoryVersion((ver) => ver + 1);
      message.success('Debited');
      setDebitOpen(false);
      await fetchList();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Debit failed');
    }
  }

  return (
    <PageContainer
      title="Admin Users"
      breadcrumb={[{ label: 'Dashboard' }, { label: 'Users' }]}
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New User</Button>}
    >
      <Card style={{ marginBottom: 12 }}>
        <Row gutter={12}>
          <Col span={10}>
            <Input allowClear placeholder="Search username or email" value={search} onChange={(e) => setSearch(e.target.value)} />
          </Col>
          <Col span={14}>
            <Space wrap>
              <Select
                allowClear
                placeholder="Role"
                value={role}
                onChange={(v) => setRole(v as any)}
                style={{ width: 160 }}
                options={[
                  { value: 'admin', label: 'Admin' },
                  { value: 'user', label: 'User' },
                  { value: 'mod', label: 'Moderator' },
                  { value: 'warehouse', label: 'Warehouse' },
                  { value: 'owner', label: 'Owner' },
                ]}
              />
              <Select
                allowClear
                placeholder="Status"
                value={status}
                onChange={(v) => setStatus(v as any)}
                style={{ width: 160 }}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
              <Button icon={<ReloadOutlined />} onClick={() => fetchList()}>Refresh</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <AdminTable<AdminUser>
          rowKey={(r) => r.id}
          loading={loading}
          dataSource={items}
          columns={columns}
          pagination={{ current: page, pageSize: limit, total: total }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Create */}
      <Drawer title="Create User" placement="right" width={520} open={createOpen} onClose={() => setCreateOpen(false)} destroyOnClose>
        <AdminUserForm form={createForm} mode="create" />
        <Space>
          <Button type="primary" onClick={onCreateSubmit}>Create</Button>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
        </Space>
      </Drawer>

      {/* Edit */}
      <Drawer title="Edit User" placement="right" width={520} open={editOpen} onClose={() => setEditOpen(false)} destroyOnClose>
        <AdminUserForm form={editForm} mode="edit" />
        <Space>
          <Button type="primary" onClick={onEditSubmit}>Save</Button>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
        </Space>
      </Drawer>

      {/* Details & Tokens */}
      <Drawer title="User Details" placement="right" width={640} open={detailOpen} onClose={() => setDetailOpen(false)} destroyOnClose>
        {current ? (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Username">{current.username}</Descriptions.Item>
              <Descriptions.Item label="Email">{current.email}</Descriptions.Item>
              <Descriptions.Item label="Role">{current.role}</Descriptions.Item>
              <Descriptions.Item label="Status">{current.status === 'active' ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>}</Descriptions.Item>
              <Descriptions.Item label="Tokens">
                <Space>
                  <DollarCircleOutlined style={{ color: '#faad14' }} />
                  <Typography.Text strong>{current.tokenBalance ?? 0}</Typography.Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Created At">{formatDateTime(current.createdAt)}</Descriptions.Item>
            </Descriptions>
            <Space style={{ marginTop: 12 }}>
              <Button onClick={openCredit} icon={<DollarCircleOutlined style={{ color: '#52c41a' }} />}>Credit</Button>
              <Button onClick={openDebit} danger icon={<DollarCircleOutlined style={{ color: '#ff4d4f' }} />}>Debit</Button>
            </Space>
            <Divider />
            <Typography.Title level={5}>Token History</Typography.Title>
            <TokenHistory userId={current.id} refreshKey={historyVersion} />
          </>
        ) : null}
      </Drawer>

      {/* Credit */}
      <Modal
        title="Credit Tokens"
        open={creditOpen}
        onCancel={() => setCreditOpen(false)}
        onOk={submitCredit}
        okText="Credit"
        destroyOnClose
        getContainer={() => document.body}
      >
        <Form form={creditForm} layout="vertical">
          <Form.Item label="Current Balance">
            <Space>
              <DollarCircleOutlined style={{ color: '#faad14' }} />
              <Typography.Text strong>{current?.tokenBalance ?? 0}</Typography.Text>
            </Space>
          </Form.Item>
          <Form.Item label="Amount" name="amount" rules={[{ required: true, type: 'number', min: 1 }]}> 
            <InputNumber style={{ width: '100%' }} min={1} placeholder="e.g., 100" />
          </Form.Item>
          <Form.Item label="Reason" name="reason"><Input placeholder="optional" /></Form.Item>
          <Form.Item label="Notes" name="notes"><Input placeholder="optional" /></Form.Item>
          <Form.Item label="Idempotency Key" name="idempotencyKey"><Input placeholder="auto-generated if empty" /></Form.Item>
        </Form>
      </Modal>

      {/* Debit */}
      <Modal
        title="Debit Tokens"
        open={debitOpen}
        onCancel={() => setDebitOpen(false)}
        onOk={submitDebit}
        okText="Debit"
        destroyOnClose
        getContainer={() => document.body}
      >
        <Form form={debitForm} layout="vertical">
          <Form.Item label="Current Balance">
            <Space>
              <DollarCircleOutlined style={{ color: '#faad14' }} />
              <Typography.Text strong>{current?.tokenBalance ?? 0}</Typography.Text>
            </Space>
          </Form.Item>
          <Form.Item label="Amount" name="amount" rules={[{ required: true, type: 'number', min: 1 }]}> 
            <InputNumber style={{ width: '100%' }} min={1} placeholder="e.g., 50" />
          </Form.Item>
          <Form.Item label="Reason" name="reason"><Input placeholder="optional" /></Form.Item>
          <Form.Item label="Notes" name="notes"><Input placeholder="optional" /></Form.Item>
          <Form.Item label="Idempotency Key" name="idempotencyKey"><Input placeholder="auto-generated if empty" /></Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}

function TokenHistory({ userId, refreshKey }: { userId: string; refreshKey: number }) {
  const [items, setItems] = useState<UsersApi.TokenHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await UsersApi.getTokenHistory(userId, { limit: 20 });
      setItems(res.items);
    } catch (e: any) {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userId) load();
  }, [userId, refreshKey]);

  return (
    <List
      loading={loading}
      dataSource={items}
      renderItem={(it) => (
        <List.Item>
          <Space>
            <DollarCircleOutlined style={{ color: it.type === 'credit' ? '#52c41a' : '#ff4d4f' }} />
            <Typography.Text strong>{it.type.toUpperCase()}</Typography.Text>
            <Typography.Text>{it.amount}</Typography.Text>
            {it.reason ? <Typography.Text type="secondary">{it.reason}</Typography.Text> : null}
            <Typography.Text type="secondary">{formatDateTime(it.createdAt)}</Typography.Text>
          </Space>
        </List.Item>
      )}
    />
  );
}
