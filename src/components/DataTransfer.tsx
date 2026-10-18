import {
  CopyOutlined,
  DownloadOutlined,
  FileTextOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Alert, Button, Input, Modal, Space, Typography, message } from "antd";
import { ChangeEvent, useRef, useState } from "react";
import {
  Backup,
  backupToText,
  createBackup,
  describeBackup,
  page,
  parseBackup,
  restoreBackup,
} from "../utils/backup.util";
import { formatDate, getToday } from "../utils/taskStorage.util";
const { Text } = Typography;

// Export / import of everything saved in this browser, to move it to another
// browser or device.
const DataTransfer = () => {
  const [modal, modalContextHolder] = Modal.useModal();
  const [messageApi, messageContextHolder] = message.useMessage();
  const fileInput = useRef<HTMLInputElement>(null);
  const [exportText, setExportText] = useState<string>();
  const [isPasteOpen, setIsPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteError, setPasteError] = useState<string>();

  const downloadFile = () => {
    const blob = new Blob([backupToText(createBackup())], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dn-overview-backup-${getToday()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      messageApi.success("Copied");
    } catch {
      messageApi.warning(
        "Copy blocked by the browser, select the text instead",
      );
    }
  };

  // Asks before replacing, then reloads so every screen reads the new data.
  const confirmImport = (backup: Backup) => {
    const { characters, ids, tasks } = describeBackup(backup);
    modal.confirm({
      title: "Replace the data in this browser?",
      content: (
        <Space direction="vertical" size={4}>
          <Text>
            Backup from {formatDate(backup.exportedAt)}: {characters}{" "}
            character(s), {ids} ID(s), {tasks} Weekly [Account] task(s), plus
            weekly progress and settings.
          </Text>
          <Text type="secondary">
            Everything currently saved here is replaced, then the page reloads.
          </Text>
        </Space>
      ),
      okText: "Import",
      okButtonProps: { danger: true },
      onOk: () => {
        restoreBackup(backup);
        page.reload();
      },
    });
  };

  const onFileChosen = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      confirmImport(parseBackup(await file.text()));
    } catch (error) {
      messageApi.error((error as Error).message);
    }
  };

  const onPasteImport = () => {
    try {
      const backup = parseBackup(pasteText);
      setIsPasteOpen(false);
      confirmImport(backup);
    } catch (error) {
      setPasteError((error as Error).message);
    }
  };

  return (
    <div>
      {modalContextHolder}
      {messageContextHolder}
      <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
        Move your characters, IDs, tasks and settings to another browser or
        device. Data is only saved in this browser otherwise.
      </Text>
      <Space wrap>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={downloadFile}
        >
          Export file
        </Button>
        <Button
          icon={<FileTextOutlined />}
          onClick={() => setExportText(backupToText(createBackup()))}
        >
          Export as text
        </Button>
        <Button
          icon={<UploadOutlined />}
          onClick={() => fileInput.current?.click()}
        >
          Import file
        </Button>
        <Button
          icon={<CopyOutlined />}
          onClick={() => {
            setPasteText("");
            setPasteError(undefined);
            setIsPasteOpen(true);
          }}
        >
          Import text
        </Button>
      </Space>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        aria-label="Backup file"
        style={{ display: "none" }}
        onChange={onFileChosen}
      />

      <Modal
        open={exportText !== undefined}
        title="Export as text"
        onCancel={() => setExportText(undefined)}
        footer={
          <Button
            type="primary"
            icon={<CopyOutlined />}
            onClick={() => copyText(exportText ?? "")}
          >
            Copy
          </Button>
        }
      >
        <Text type="secondary">
          Copy this and use Import text on the other browser or device.
        </Text>
        <Input.TextArea
          aria-label="Backup text"
          value={exportText}
          readOnly
          autoSize={{ minRows: 4, maxRows: 10 }}
          style={{ marginTop: 8, fontFamily: "monospace", fontSize: 12 }}
        />
      </Modal>

      <Modal
        open={isPasteOpen}
        title="Import text"
        okText="Import"
        okButtonProps={{ disabled: !pasteText.trim() }}
        onOk={onPasteImport}
        onCancel={() => setIsPasteOpen(false)}
      >
        <Text type="secondary">Paste the text from Export as text.</Text>
        <Input.TextArea
          aria-label="Backup text to import"
          value={pasteText}
          onChange={(e) => {
            setPasteText(e.target.value);
            setPasteError(undefined);
          }}
          autoSize={{ minRows: 4, maxRows: 10 }}
          style={{ marginTop: 8, fontFamily: "monospace", fontSize: 12 }}
        />
        {pasteError && (
          <Alert type="error" message={pasteError} style={{ marginTop: 8 }} />
        )}
      </Modal>
    </div>
  );
};

export default DataTransfer;
