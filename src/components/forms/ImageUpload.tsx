import { useMemo, useState } from 'react';
import { Upload, UploadProps, Button, Image, Space, Typography, message } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import { http } from '@/services/http/axios';

export type ImageUploadProps = {
  value?: string;
  onChange?: (url?: string) => void;
  disabled?: boolean;
  accept?: string; // e.g. 'image/*'
  maxSizeMB?: number; // default 5MB
  buttonText?: string;
  placeholder?: string;
  listType?: UploadProps['listType'];
};

export default function ImageUpload({
  value,
  onChange,
  disabled,
  accept = 'image/*',
  maxSizeMB = 5,
  buttonText = 'Upload',
  placeholder = 'Upload image',
  listType = 'picture-card',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const fileList: UploadFile[] = useMemo(() => {
    if (!value) return [];
    const name = value.split('/').pop() || 'image';
    return [
      {
        uid: '-1',
        name,
        status: 'done',
        url: value,
      },
    ];
  }, [value]);

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const rcFile = file as RcFile;
    const mime = (rcFile.type || '').toLowerCase();
    const fname = (rcFile.name || '').toLowerCase();

    const isAccepted = (() => {
      if (!accept) return true;
      const rules = accept.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (rules.length === 0) return true;
      return rules.some((rule) => {
        if (rule.endsWith('/*')) {
          const base = rule.slice(0, -1); // keep trailing '/'
          return mime.startsWith(base);
        }
        if (rule.startsWith('.')) {
          return fname.endsWith(rule);
        }
        return mime === rule; // exact mime
      });
    })();

    if (!isAccepted) {
      message.error(`File type not accepted. Allowed: ${accept}`);
      return Upload.LIST_IGNORE;
    }
    const isLtMax = rcFile.size / 1024 / 1024 < maxSizeMB;
    if (!isLtMax) {
      message.error(`File must be smaller than ${maxSizeMB}MB`);
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const { file, onError, onProgress, onSuccess } = options;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file as RcFile);
      // Always post to '/uploads' (no '/admin' prefix). Base URL handles prefixing.
      const res = await http.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          const percent = evt.total ? Math.round((evt.loaded / evt.total) * 100) : 0;
          onProgress?.({ percent });
        },
      });
      const body = res.data || {};
      const uploadedUrl = body?.data?.publicUrl ?? body?.publicUrl;
      if (!uploadedUrl) throw new Error('Upload succeeded but missing publicUrl');
      onChange?.(uploadedUrl);
      onSuccess?.(body, new XMLHttpRequest());
      message.success('Uploaded');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Upload failed';
      message.error(msg);
      onError?.(e);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove: UploadProps['onRemove'] = async () => {
    onChange?.(undefined);
    return true;
  };

  return (
    <div>
      <Upload
        listType={listType}
        accept={accept}
        multiple={false}
        maxCount={1}
        disabled={disabled || uploading}
        beforeUpload={beforeUpload}
        customRequest={customRequest}
        onRemove={handleRemove}
        fileList={fileList}
        showUploadList={{ showRemoveIcon: true }}
      >
        {fileList.length === 0 ? (
          listType === 'picture-card' ? (
            <div style={{ width: 104, height: 104, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Space direction="vertical" align="center">
                <PlusOutlined />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>{buttonText}</Typography.Text>
              </Space>
            </div>
          ) : (
            <Button icon={<UploadOutlined />} disabled={disabled || uploading}>{buttonText}</Button>
          )
        ) : null}
      </Upload>
      {value && listType !== 'picture-card' ? (
        <div style={{ marginTop: 8 }}>
          <Space>
            <Image src={value} width={80} height={80} style={{ objectFit: 'cover' }} alt={placeholder} />
            <Button icon={<DeleteOutlined />} danger onClick={() => onChange?.(undefined)} disabled={disabled || uploading}>
              Remove
            </Button>
          </Space>
        </div>
      ) : null}
    </div>
  );
}
