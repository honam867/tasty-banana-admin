import { useEffect, useState } from 'react';
import { Button, Card, Drawer, Form, Input, Select, Switch, Tag, Typography, message, Space, Row, Col, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, BulbOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import * as HintsApi from '@/features/prompts/api/hints.api';
import * as TemplatesApi from '@/features/prompts/api/templates.api';
import { AdminTable, ActionIconButton } from '@/components/admin/AdminTable';
import PageContainer from '@/components/PageContainer';

type Hint = HintsApi.Hint;
type Template = TemplatesApi.PromptTemplate;

export default function HintsPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Hint[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedHint, setSelectedHint] = useState<Hint | null>(null);
  const [editing, setEditing] = useState<Hint | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const [search, setSearch] = useState<string>('');
  const [onlyActive, setOnlyActive] = useState<boolean | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);

  async function fetchList() {
    setLoading(true);
    try {
      const data = await HintsApi.listHints({ search: search || undefined, isActive: onlyActive, type: typeFilter });
      setItems(data);
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to load hints');
    } finally {
      setLoading(false);
    }
  }

  async function fetchTemplates() {
    try {
      const list = await TemplatesApi.listPromptTemplates({ isActive: true });
      setTemplates(list);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, onlyActive, typeFilter]);

  function openAddTemplate(hint: Hint) {
    setSelectedHint(hint);
    setDrawerOpen(true);
    fetchTemplates();
  }

  function openEdit(hint: Hint) {
    setEditing(hint);
    editForm.setFieldsValue({
      name: hint.name,
      type: hint.type,
      description: hint.description,
      isActive: hint.isActive,
    });
    setEditDrawerOpen(true);
  }

  async function onSubmit(values: any) {
    if (!selectedHint) return;
    try {
      await HintsApi.addTemplateToHint(selectedHint.id, values.templateId);
      message.success('Đã thêm template vào hint');
      setDrawerOpen(false);
      form.resetFields();
      fetchList();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Thêm template thất bại');
    }
  }

  const columns: ColumnsType<Hint> = [
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Loại', dataIndex: 'type', key: 'type' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v: boolean) => (v ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <ActionIconButton title="Add template" icon={<PlusOutlined />} color="#1677ff" onClick={() => openAddTemplate(record)} />
          <ActionIconButton title="Edit" icon={<EditOutlined />} color="#faad14" onClick={() => openEdit(record)} />
          <Popconfirm title="Delete this hint?" onConfirm={async () => {
            try { await HintsApi.deleteHint(record.id); message.success('Deleted'); fetchList(); } catch (e: any) { message.error(e?.response?.data?.message || 'Delete failed'); }
          }} okText="Delete" cancelText="Cancel">
            <span>
              <ActionIconButton title="Delete" icon={<DeleteOutlined />} danger />
            </span>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Basic type options for filter input; remove or replace if server returns a catalog
  const typeOptions = Array.from(new Set(items.map((i) => i.type).filter(Boolean) as string[])).map((t) => ({ label: t, value: t }));

  return (
    <PageContainer
      title="Hints"
      breadcrumb={[{ label: 'Dashboard' }, { label: 'Hints' }]}
    >
      <Card style={{ marginBottom: 12 }}>
        <Row gutter={12}>
          <Col span={10}>
            <Input allowClear placeholder="Tìm kiếm theo tên" value={search} onChange={(e) => setSearch(e.target.value)} />
          </Col>
          <Col span={7}>
            <Select allowClear placeholder="Lọc theo loại" style={{ width: '100%' }} options={typeOptions} value={typeFilter} onChange={(v) => setTypeFilter(v)} />
          </Col>
          <Col span={7}>
            <Space>
              <Typography.Text>Chỉ hiển thị đang hoạt động</Typography.Text>
              <Switch checked={onlyActive === true} onChange={(checked) => setOnlyActive(checked ? true : undefined)} />
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <AdminTable<Hint> rowKey={(r) => r.id} loading={loading} dataSource={items} columns={columns} />
      </Card>

      <Drawer
        title={selectedHint ? `Thêm Template vào: ${selectedHint.name}` : 'Thêm Template'}
        placement="right"
        width={520}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={onSubmit}>
          <Form.Item label="Template" name="templateId" rules={[{ required: true, message: 'Vui lòng chọn template' }]}>
            <Select
              showSearch
              placeholder="Chọn template"
              options={templates.map((t) => ({ label: t.name, value: t.id }))}
              filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Thêm</Button>
              <Button onClick={() => setDrawerOpen(false)}>Huỷ</Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title={editing ? `Chỉnh sửa Hint: ${editing.name}` : 'Chỉnh sửa Hint'}
        placement="right"
        width={520}
        open={editDrawerOpen}
        onClose={() => { setEditDrawerOpen(false); setEditing(null); }}
        destroyOnClose
      >
        <Form layout="vertical" form={editForm} onFinish={async (values: any) => {
          if (!editing) return; 
          try { 
            await HintsApi.updateHint(editing.id, { name: values.name, type: values.type, description: values.description, isActive: values.isActive }); 
            message.success('Cập nhật thành công');
            setEditDrawerOpen(false);
            setEditing(null);
            fetchList();
          } catch (e: any) { message.error(e?.response?.data?.message || 'Cập nhật thất bại'); }
        }}>
          <Form.Item label="Tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Loại" name="type">
            <Input />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="Kích hoạt" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Lưu</Button>
              <Button onClick={() => { setEditDrawerOpen(false); setEditing(null); }}>Huỷ</Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </PageContainer>
  );
}



