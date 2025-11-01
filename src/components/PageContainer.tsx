import { Breadcrumb, Space, Typography, theme } from 'antd';
import { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  title?: string;
  extra?: React.ReactNode;
  breadcrumb?: { label: string; path?: string }[];
}>;

export default function PageContainer({ title, extra, breadcrumb, children }: Props) {
  const { token } = theme.useToken();
  return (
    <div style={{ background: token.colorBgContainer, padding: 16, borderRadius: token.borderRadius }}>
      {(title || breadcrumb) && (
        <div style={{ marginBottom: 12 }}>
          {breadcrumb && (
            <Breadcrumb
              items={breadcrumb.map((b) => ({ title: b.label }))}
              style={{ marginBottom: 8 }}
            />
          )}
          {title && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {title}
              </Typography.Title>
              {extra && <Space>{extra}</Space>}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
