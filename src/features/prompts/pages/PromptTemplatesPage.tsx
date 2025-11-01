import { useEffect, useState } from 'react';
import { Button, Card, Drawer, Form, Input, Switch, Table, Tag, Typography, message, Space, Row, Col, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import * as TemplatesApi from '@/features/prompts/api/templates.api';
import PageContainer from '@/components/PageContainer';

type Template = TemplatesApi.PromptTemplate;

export default function PromptTemplatesPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Template[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form] = Form.useForm();

  const [search, setSearch] = useState<string>('');
  const [onlyActive, setOnlyActive] = useState<boolean | undefined>(undefined);

  async function fetchList() {
    setLoading(true);
    try {
      const data = await TemplatesApi.listPromptTemplates({ search: search || undefined, isActive: onlyActive });
      setItems(data);
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, onlyActive]);

  async function onSubmit(values: any) {
    try {
      if (editing) {
        await TemplatesApi.updateTemplate(editing.id, {
          name: values.name,
          prompt: values.prompt,
          previewUrl: values.previewUrl,
          isActive: values.isActive,
        });
        message.success('Cập nhật template thành công');
      } else {
        await TemplatesApi.createTemplate({
          name: values.name,
          prompt: values.prompt,
          previewUrl: values.previewUrl,
          isActive: values.isActive,
        });
        message.success('Tạo template thành công');
      }
      setDrawerOpen(false);
      setEditing(null);
      form.resetFields();
      fetchList();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Lưu template thất bại');
    }
  }

  function openAdd() {
    setEditing(null);
    form.resetFields();
    setDrawerOpen(true);
  }

  function openEdit(record: Template) {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      prompt: record.prompt,
      previewUrl: record.previewUrl,
      isActive: record.isActive,
    });
    setDrawerOpen(true);
  }

  async function handleDelete(record: Template) {
    try {
      await TemplatesApi.deleteTemplate(record.id);
      message.success('Đã xoá template');
      fetchList();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Xoá thất bại');
    }
  }

  const columns: ColumnsType<Template> = [
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    {
      title: 'Preview',
      dataIndex: 'previewUrl',
      key: 'previewUrl',
      render: (url?: string) => (url ? <a href={url} target="_blank" rel="noreferrer">Xem</a> : '-'),
    },
    { title: 'Prompt', dataIndex: 'prompt', key: 'prompt', ellipsis: true },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v: boolean) => (v ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>),
    },
    { title: 'Tạo lúc', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: 'Hành động',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button onClick={() => openEdit(record)}>Sửa</Button>
          <Popconfirm title="Xác nhận xoá?" onConfirm={() => handleDelete(record)} okText="Xoá" cancelText="Huỷ">
            <Button danger>Xoá</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="Prompt Templates"
      breadcrumb={[{ label: 'Dashboard' }, { label: 'Prompt Templates' }]}
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Thêm</Button>}
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
        <Table<Template> rowKey={(r) => r.id} loading={loading} dataSource={items} columns={columns} />
      </Card>

      <Drawer title={editing ? 'Chỉnh sửa Prompt Template' : 'Thêm Prompt Template'} placement="right" width={520} open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditing(null); }} destroyOnClose>
        <Form layout="vertical" form={form} onFinish={onSubmit}>
          <Form.Item label="Tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="Ví dụ: Cinematic Portrait" prefix={<FileTextOutlined />} />
          </Form.Item>
          <Form.Item label="Prompt" name="prompt" rules={[{ required: true, message: 'Vui lòng nhập prompt' }]}>
            <Input.TextArea rows={5} placeholder="Mô tả chi tiết..." />
          </Form.Item>
          <Form.Item label="Preview URL" name="previewUrl" rules={[{ type: 'url', message: 'URL không hợp lệ' }]}>
            <Input placeholder="https://example.com/preview.jpg" />
          </Form.Item>
          <Form.Item label="Kích hoạt" name="isActive" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Lưu</Button>
              <Button onClick={() => setDrawerOpen(false)}>Huỷ</Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </PageContainer>
  );
}
