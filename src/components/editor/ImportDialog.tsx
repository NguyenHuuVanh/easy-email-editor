import React, { useState, useCallback } from "react";
import {
  Modal,
  Tabs,
  Input,
  Button,
  Message,
  Upload,
  Space,
} from "@arco-design/web-react";
import { IconUpload, IconCode } from "@arco-design/web-react/icon";
import { MjmlToJson } from "easy-email-extensions";
import { useBlock, useEditorContext } from "easy-email-editor";

const { TextArea } = Input;
const TabPane = Tabs.TabPane;

interface ImportDialogProps {
  visible: boolean;
  onClose: () => void;
}

export default function ImportDialog({ visible, onClose }: ImportDialogProps) {
  const [activeTab, setActiveTab] = useState("mjml");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { formHelpers } = useEditorContext();

  const handleImportMJML = useCallback(() => {
    if (!code.trim()) {
      Message.warning("Please paste MJML code first");
      return;
    }

    setLoading(true);
    try {
      const trimmed = code.trim();
      let mjmlCode = trimmed;

      // Ensure it starts with <mjml>
      if (!mjmlCode.startsWith("<mjml")) {
        Message.error("Invalid MJML: must start with <mjml> tag");
        setLoading(false);
        return;
      }

      const jsonData = MjmlToJson(mjmlCode);
      if (jsonData) {
        formHelpers.change("content", jsonData);
        Message.success("MJML imported successfully!");
        setCode("");
        onClose();
      } else {
        Message.error("Failed to parse MJML");
      }
    } catch (error: any) {
      Message.error(`Import failed: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }, [code, formHelpers, onClose]);

  const handleImportHTML = useCallback(() => {
    if (!code.trim()) {
      Message.warning("Please paste HTML code first");
      return;
    }

    setLoading(true);
    try {
      // Wrap HTML in basic MJML structure for conversion
      const mjmlWrapped = `
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>
          ${code.trim()}
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

      const jsonData = MjmlToJson(mjmlWrapped);
      if (jsonData) {
        formHelpers.change("content", jsonData);
        Message.success("HTML imported successfully!");
        setCode("");
        onClose();
      } else {
        Message.error("Failed to parse HTML");
      }
    } catch (error: any) {
      Message.error(`Import failed: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }, [code, formHelpers, onClose]);

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCode(content);
    };
    reader.readAsText(file);
    return false; // prevent default upload
  }, []);

  return (
    <Modal
      title="Import Template"
      visible={visible}
      onCancel={onClose}
      footer={null}
      style={{ width: 700 }}
      unmountOnExit
    >
      <Tabs activeTab={activeTab} onChange={setActiveTab}>
        <TabPane key="mjml" title="Import MJML">
          <div style={{ marginBottom: 12 }}>
            <p style={{ color: "#666", fontSize: 13, marginBottom: 8 }}>
              Paste your MJML code below or upload an .mjml file.
            </p>
            <Upload
              accept=".mjml,.xml"
              beforeUpload={(file) => {
                handleFileUpload(file);
                return Promise.resolve(false) as any;
              }}
              showUploadList={false}
            >
              <Button
                icon={<IconUpload />}
                size="small"
                style={{ marginBottom: 8 }}
              >
                Upload .mjml file
              </Button>
            </Upload>
            <TextArea
              placeholder={`<mjml>\n  <mj-body>\n    <mj-section>\n      ...\n    </mj-section>\n  </mj-body>\n</mjml>`}
              value={code}
              onChange={setCode}
              style={{ minHeight: 300, fontFamily: "monospace", fontSize: 12 }}
            />
          </div>
          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={onClose}>Cancel</Button>
              <Button
                type="primary"
                loading={loading}
                onClick={handleImportMJML}
              >
                Import MJML
              </Button>
            </Space>
          </div>
        </TabPane>

        <TabPane key="html" title="Import HTML">
          <div style={{ marginBottom: 12 }}>
            <p style={{ color: "#666", fontSize: 13, marginBottom: 8 }}>
              Paste your HTML code below. It will be wrapped in an MJML
              template.
            </p>
            <Upload
              accept=".html,.htm"
              beforeUpload={(file) => {
                handleFileUpload(file);
                return Promise.resolve(false) as any;
              }}
              showUploadList={false}
            >
              <Button
                icon={<IconUpload />}
                size="small"
                style={{ marginBottom: 8 }}
              >
                Upload .html file
              </Button>
            </Upload>
            <TextArea
              placeholder={`<div>\n  <h1>Your HTML content</h1>\n  <p>Paste your email HTML here...</p>\n</div>`}
              value={code}
              onChange={setCode}
              style={{ minHeight: 300, fontFamily: "monospace", fontSize: 12 }}
            />
          </div>
          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={onClose}>Cancel</Button>
              <Button
                type="primary"
                loading={loading}
                onClick={handleImportHTML}
              >
                Import HTML
              </Button>
            </Space>
          </div>
        </TabPane>
      </Tabs>
    </Modal>
  );
}
