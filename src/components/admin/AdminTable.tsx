import { Table } from 'antd';
import type { TableProps } from 'antd';
import { Tooltip, Button } from 'antd';
import type { ReactNode, MouseEvent } from 'react';

export type AdminTableProps<RecordType extends object> = TableProps<RecordType>;

export function AdminTable<RecordType extends object>(props: AdminTableProps<RecordType>) {
  return <Table<RecordType> size="small" {...props} />;
}

export type ActionIconButtonProps = {
  icon: ReactNode;
  title: string;
  color?: string;
  danger?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
};

export function ActionIconButton({ icon, title, color, danger, onClick, disabled }: ActionIconButtonProps) {
  return (
    <Tooltip title={title} placement="top">
      <Button
        type="text"
        shape="circle"
        icon={icon}
        onClick={onClick}
        disabled={disabled}
        danger={danger}
        style={!danger && color ? { color } : undefined}
      />
    </Tooltip>
  );
}

