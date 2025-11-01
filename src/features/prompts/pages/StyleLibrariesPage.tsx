import { useEffect, useState } from 'react';
import { Button, Card, Drawer, Form, Select, Switch, Tag, Typography, message, Space, Row, Col, Input, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, AppstoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import * as StylesApi from '@/features/prompts/api/style-library.api';
import * as TemplatesApi from '@/features/prompts/api/templates.api';
import { AdminTable, ActionIconButton } from '@/components/admin/AdminTable';
import PageContainer from '@/components/PageContainer';

type StyleLibrary = StylesApi.StyleLibrary;
type Template = TemplatesApi.PromptTemplate;

export default function StyleLibrariesPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<StyleLibrary[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<StyleLibrary | null>(null);
  const [editing, setEditing] = useState<StyleLibrary | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const [search, setSearch] = useState<string>('');
  const [onlyActive, setOnlyActive] = useState<boolean | undefined>(undefined);

  async function fetchList() {
    setLoading(true);
    try {
      const data = await StylesApi.listStyleLibraries({ search: search || undefined, isActive: onlyActive });
      setItems(data);
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to load style libraries');
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
  }, [search, onlyActive]);

  function openAddTemplate(style: StyleLibrary) {
    setSelectedStyle(style);
    setDrawerOpen(true);
    fetchTemplates();
  }

  function openEdit(style: StyleLibrary) {
    setEditing(style);
    editForm.setFieldsValue({
      name: style.name,
      description: style.description,
      isActive: style.isActive,
    });
    setEditDrawerOpen(true);
  }

  async function onSubmit(values: any) {
    if (!selectedStyle) return;
    try {
      await StylesApi.addTemplateToStyle(selectedStyle.id, values.templateId);
      message.success('Đã thêm template vào style');
      setDrawerOpen(false);
      form.resetFields();
      fetchList();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Thêm template thất bại');
    }
  }

  const columns: ColumnsType<StyleLibrary> = [
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Số templates',
      dataIndex: 'promptTemplateIds',
      key: 'count',
      render: (ids: string[]) => ids?.length ?? 0,
    },
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
          <Popconfirm title="Delete this style?" onConfirm={async () => {
            try { await StylesApi.deleteStyleLibrary(record.id); message.success('Deleted'); fetchList(); } catch (e: any) { message.error(e?.response?.data?.message || 'Delete failed'); }
          }} okText="Delete" cancelText="Cancel">
            <span>
              <ActionIconButton title="Delete" icon={<DeleteOutlined />} danger />
            </span>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="Style Libraries"
      breadcrumb={[{ label: 'Dashboard' }, { label: 'Style Libraries' }]}
    >
      <Card style={{ marginBottom: 12 }}>
        <Row gutter={12}>
          <Col span={12}>
            <Input allowClear placeholder="Tìm kiếm theo tên" value={search} onChange={(e) => setSearch(e.target.value)} />
          </Col>
          <Col span={12}>
            <Space>
              <Typography.Text>Chỉ hiển thị đang hoạt động</Typography.Text>
              <Switch checked={onlyActive === true} onChange={(checked) => setOnlyActive(checked ? true : undefined)} />
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <AdminTable<StyleLibrary> rowKey={(r) => r.id} loading={loading} dataSource={items} columns={columns} />
      </Card>

      <Drawer
        title={selectedStyle ? `Thêm Template vào: ${selectedStyle.name}` : 'Thêm Template'}
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
        title={editing ? `Chỉnh sửa Style: ${editing.name}` : 'Chỉnh sửa Style'}
        placement="right"
        width={520}
        open={editDrawerOpen}
        onClose={() => { setEditDrawerOpen(false); setEditing(null); }}
        destroyOnClose
      >
        <Form layout="vertical" form={editForm} onFinish={async (values: any) => {
          if (!editing) return; 
          try { 
            await StylesApi.updateStyleLibrary(editing.id, { name: values.name, description: values.description, isActive: values.isActive }); 
            message.success('Cập nhật thành công');
            setEditDrawerOpen(false);
            setEditing(null);
            fetchList();
          } catch (e: any) { message.error(e?.response?.data?.message || 'Cập nhật thất bại'); }
        }}>
          <Form.Item label="Tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
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






