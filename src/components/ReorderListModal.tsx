import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
} from "@ant-design/icons";
import { Button, List, Modal, Space, Tooltip, Typography } from "antd";
import { ReactNode, useEffect, useState } from "react";
const { Text } = Typography;

export interface ReorderItem {
  id: string;
  content: ReactNode;
}

interface ReorderListModalProps {
  title: string;
  open: boolean;
  items: ReorderItem[];
  onSave: (orderedIds: string[]) => void;
  onClose: () => void;
}

const ReorderListModal = ({
  title,
  open,
  items,
  onSave,
  onClose,
}: ReorderListModalProps) => {
  const [order, setOrder] = useState<ReorderItem[]>([]);

  // Start from the saved order every time the modal opens.
  useEffect(() => {
    if (open) setOrder(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length || from === to) return;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const last = order.length - 1;

  return (
    <Modal
      title={title}
      open={open}
      okText="Save"
      onOk={() => {
        onSave(order.map((item) => item.id));
        onClose();
      }}
      onCancel={onClose}
    >
      <List
        size="small"
        dataSource={order}
        rowKey="id"
        renderItem={(item, idx) => (
          <List.Item
            actions={[
              <Space size={0} key="move">
                <Tooltip title="Move to top">
                  <Button
                    type="text"
                    size="small"
                    icon={<VerticalAlignTopOutlined />}
                    disabled={idx === 0}
                    onClick={() => move(idx, 0)}
                  />
                </Tooltip>
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowUpOutlined />}
                  disabled={idx === 0}
                  onClick={() => move(idx, idx - 1)}
                />
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowDownOutlined />}
                  disabled={idx === last}
                  onClick={() => move(idx, idx + 1)}
                />
                <Tooltip title="Move to bottom">
                  <Button
                    type="text"
                    size="small"
                    icon={<VerticalAlignBottomOutlined />}
                    disabled={idx === last}
                    onClick={() => move(idx, last)}
                  />
                </Tooltip>
              </Space>,
            ]}
          >
            <Space size={4} wrap>
              <Text type="secondary">{idx + 1}.</Text>
              {item.content}
            </Space>
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default ReorderListModal;
