import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Drawer, Form, Input, InputNumber, Switch, Table, Tag, Typography, message, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import * as OperationsApi from '@/features/operations/api/operations.api';
import PageContainer from '@/components/PageContainer';

type Operation = OperationsApi.Operation;

export default function OperationsPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Operation[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Operation | null>(null);
  const [form] = Form.useForm();

  async function fetchList() {
    setLoading(true);
    try {
      const data = await OperationsApi.listOperations();
      setItems(data);
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to load operations');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  function openAdd() {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true });
    setDrawerOpen(true);
  }

  function openEdit(record: Operation) {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      tokensPerOperation: record.tokensPerOperation,
      description: record.description,
      isActive: record.isActive,
    });
    setDrawerOpen(true);
  }

  async function handleDelete(record: Operation) {
    try {
      await OperationsApi.deleteOperation(record.id);
      message.success('Đã xoá thành công');
      fetchList();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Xoá thất bại');
    }
  }

  async function onSubmit(values: any) {
    try {
      if (editing) {
        const payload: OperationsApi.UpdateOperationDto = {
          tokensPerOperation: values.tokensPerOperation,
          description: values.description,
          isActive: values.isActive,
        };
        await OperationsApi.updateOperation(editing.id, payload);
        message.success('Cập nhật thành công');
      } else {
        const payload: OperationsApi.CreateOperationDto = {
          name: values.name,
          tokensPerOperation: values.tokensPerOperation,
          description: values.description,
          isActive: values.isActive ?? true,
        };
        await OperationsApi.createOperation(payload);
        message.success('Tạo mới thành công');
      }
      setDrawerOpen(false);
      fetchList();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Lưu thất bại');
    }
  }

  const columns: ColumnsType<Operation> = useMemo(
    () => [
      { title: 'Tên', dataIndex: 'name', key: 'name' },
      { title: 'Tokens/Op', dataIndex: 'tokensPerOperation', key: 'tokensPerOperation' },
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
        width: 160,
        render: (_, record) => (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => openEdit(record)}>
              Sửa
            </Button>
            <Popconfirm title="Xác nhận xoá?" onConfirm={() => handleDelete(record)} okText="Xoá" cancelText="Huỷ">
              <Button danger icon={<DeleteOutlined />}>Xoá</Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    []
  );

  return (
    <PageContainer
      title="Quản lý Token"
      breadcrumb={[{ label: 'Dashboard' }, { label: 'Quản lý Token' }]}
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Thêm</Button>}
    >
      <Card>
        <Table<Operation>
          rowKey={(r) => r.id}
          loading={loading}
          dataSource={items}
          columns={columns}
        />
      </Card>

      <Drawer
        title={editing ? 'Chỉnh sửa Operation' : 'Thêm Operation'}
        placement="right"
        width={480}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={onSubmit}>
          <Form.Item label="Tên" name="name" rules={editing ? [] : [{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="vd: text_to_image" disabled={!!editing} />
          </Form.Item>
          <Form.Item label="Tokens mỗi thao tác" name="tokensPerOperation" rules={[{ required: true, message: 'Vui lòng nhập số tokens' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={4} placeholder="Mô tả ngắn" />
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

