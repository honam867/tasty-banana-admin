import { ConfigProvider, theme } from 'antd';
import { PropsWithChildren } from 'react';

export default function AntdProvider({ children }: PropsWithChildren) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          borderRadius: 6,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

