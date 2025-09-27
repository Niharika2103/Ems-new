import { Modal } from "antd";

export default function ReusableModal({
  open,
  onClose,
  title,
  width = 700,
  children,
  footer = null,
}) {
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={footer}
      width={width}
      destroyOnClose
    >
      {children}
    </Modal>
  );
}
