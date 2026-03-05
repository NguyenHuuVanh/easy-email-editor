import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Button,
  Dropdown,
  Menu,
  Message,
  Space,
  Tooltip,
  Modal,
  Input,
} from "@arco-design/web-react";
import {
  IconLeft,
  IconUndo,
  IconRedo,
  IconSave,
  IconImport,
  IconExport,
  IconDesktop,
  IconMobile,
  IconSend,
  IconZoomIn,
  IconZoomOut,
  IconEdit,
  IconEye,
  IconCheck,
  IconClose,
} from "@arco-design/web-react/icon";
import {
  useBlock,
  useActiveTab,
  ActiveTabKeys,
  IEmailTemplate,
  Stack,
} from "easy-email-editor";
import { JsonToMjml } from "easy-email-core";
import mjml from "mjml-browser";
import { saveAs } from "file-saver";
import { saveTemplate, sendTestEmail } from "@/services/image-upload";
import { PencilLine } from "lucide-react";
import { useFormState, useForm } from "react-final-form";

interface TopToolbarProps {
  values: IEmailTemplate;
  onBack: () => void;
  onImport: () => void;
  templateId: string;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export default function TopToolbar({
  values,
  onBack,
  onImport,
  templateId,
  zoom,
  onZoomChange,
}: TopToolbarProps) {
  const { undo, redo, undoable, redoable } = useBlock();
  const { activeTab, setActiveTab } = useActiveTab();
  const [saving, setSaving] = useState(false);
  const [sendDialogVisible, setSendDialogVisible] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);

  // Inline editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(values.subject || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const form = useForm();

  const startEditing = useCallback(() => {
    const subject = form.getState().values?.subject || "";
    setEditTitle(subject || "New Template");
    console.log(editTitle);
    setIsEditingTitle(true);
  }, [form]);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingTitle]);

  const saveAndClose = useCallback(() => {
    const trimmed = editTitle.trim();
    if (trimmed) {
      form.change("subject", trimmed);
      Message.success("Template name updated");
    }
    setIsEditingTitle(false);
  }, [editTitle, form]);

  const cancelEdit = useCallback(() => {
    setIsEditingTitle(false);
    setEditTitle(form.getState().values?.subject || "New Template");
  }, [form]);

  const editContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isEditingTitle) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        editContainerRef.current &&
        !editContainerRef.current.contains(e.target as Node)
      ) {
        saveAndClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditingTitle, saveAndClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        saveAndClose();
      } else if (e.key === "Escape") {
        setIsEditingTitle(false);
      }
    },
    [saveAndClose, cancelEdit],
  );

  const onExportMJML = useCallback(() => {
    const mjmlString = JsonToMjml({
      data: values.content,
      mode: "production",
      context: values.content,
    });
    navigator.clipboard.writeText(mjmlString);
    saveAs(new Blob([mjmlString], { type: "text/mjml" }), "easy-email.mjml");
    Message.success("MJML exported & copied to clipboard");
  }, [values]);

  const onExportHTML = useCallback(() => {
    const mjmlString = JsonToMjml({
      data: values.content,
      mode: "production",
      context: values.content,
    });
    const html = mjml(mjmlString, {}).html;
    navigator.clipboard.writeText(html);
    saveAs(new Blob([html], { type: "text/html" }), "easy-email.html");
    Message.success("HTML exported & copied to clipboard");
  }, [values]);

  const onExportJSON = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(values, null, 2));
    saveAs(
      new Blob([JSON.stringify(values, null, 2)], {
        type: "application/json",
      }),
      "easy-email.json",
    );
    Message.success("JSON exported & copied to clipboard");
  }, [values]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    const success = await saveTemplate(templateId, values);
    setSaving(false);
    if (success) {
      Message.success("Template saved!");
    } else {
      // Save locally as fallback
      localStorage.setItem(
        `email-template-${templateId}`,
        JSON.stringify(values),
      );
      Message.success("Saved locally");
    }
  }, [templateId, values]);

  const handleSendTest = useCallback(async () => {
    if (!testEmail.trim()) {
      Message.warning("Please enter an email address");
      return;
    }
    setSending(true);
    const mjmlString = JsonToMjml({
      data: values.content,
      mode: "production",
      context: values.content,
    });
    const html = mjml(mjmlString, {}).html;
    const success = await sendTestEmail(
      testEmail,
      values.subject || "Test Email",
      html,
    );
    setSending(false);
    if (success) {
      Message.success(`Test email sent to ${testEmail}`);
      setSendDialogVisible(false);
    } else {
      Message.error("Failed to send test email. Check backend connection.");
    }
  }, [testEmail, values]);

  return (
    <>
      <div className="pro-toolbar">
        {/* Left section */}
        <div className="pro-toolbar-left">
          <Tooltip content="Back to templates">
            <Button
              className="pro-toolbar-btn"
              icon={<IconLeft />}
              onClick={onBack}
            />
          </Tooltip>
          <div className="pro-toolbar-divider" />

          {isEditingTitle ? (
            <div
              className="pro-toolbar-title-edit h-full"
              ref={editContainerRef}
            >
              <input
                className="h-8 w-[300px] rounded border border-gray-300 px-2 text-sm text-black"
                type="text"
                ref={inputRef}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={100}
              />
            </div>
          ) : (
            <div
              className="pro-toolbar-title-display flex items-center gap-2"
              onClick={startEditing}
              title="Click to edit template name"
            >
              <span className="pro-toolbar-title">
                {form.getState().values?.subject || "Untitled Template"}
              </span>
              <PencilLine className="pro-toolbar-title-icon w-4 h-4 cursor-pointer" />
            </div>
          )}
        </div>

        {/* Center section — Device Toggle */}
        <div className="pro-toolbar-center">
          <div className="pro-device-toggle">
            <div className="flex items-center">
              <Button
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors text-gray-600 hover:text-gray-900 ${activeTab === ActiveTabKeys.EDIT ? "bg-white text-gray-900 shadow-sm" : ""}`}
                onClick={() => setActiveTab(ActiveTabKeys.EDIT)}
              >
                Edit
                <IconEdit className="w-5 h-5" />
              </Button>
              <Button
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors text-gray-600 hover:text-gray-900 ${activeTab === ActiveTabKeys.PC ? "bg-white text-gray-900 shadow-sm" : ""}`}
                onClick={() => setActiveTab(ActiveTabKeys.PC)}
              >
                Desktop
                <IconDesktop className="w-5 h-5" />
              </Button>
              <Button
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === ActiveTabKeys.MOBILE ? "bg-white text-gray-900 shadow-sm" : "bg-gray-100 text-gray-600 hover:text-gray-900"}`}
                onClick={() => setActiveTab(ActiveTabKeys.MOBILE)}
              >
                <IconMobile className="w-5 h-5" />
                Mobile
              </Button>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="pro-toolbar-right">
          <Tooltip content="Undo (Ctrl+Z)">
            <Button
              className="pro-toolbar-btn"
              icon={<IconUndo />}
              disabled={!undoable}
              onClick={undo}
            />
          </Tooltip>
          <Tooltip content="Redo (Ctrl+Y)">
            <Button
              className="pro-toolbar-btn"
              icon={<IconRedo />}
              disabled={!redoable}
              onClick={redo}
            />
          </Tooltip>

          <div className="pro-toolbar-divider" />

          {/* Zoom controls */}
          <div className="pro-zoom-controls">
            <Tooltip content="Zoom out">
              <Button
                className="pro-toolbar-btn"
                icon={<IconZoomOut />}
                onClick={() => onZoomChange(Math.max(50, zoom - 10))}
                disabled={zoom <= 50}
              />
            </Tooltip>
            <span className="pro-zoom-label">{zoom}%</span>
            <Tooltip content="Zoom in">
              <Button
                className="pro-toolbar-btn"
                icon={<IconZoomIn />}
                onClick={() => onZoomChange(Math.min(150, zoom + 10))}
                disabled={zoom >= 150}
              />
            </Tooltip>
          </div>

          <div className="pro-toolbar-divider" />

          <Tooltip content="Import template">
            <Button
              className="pro-toolbar-btn"
              icon={<IconImport />}
              onClick={onImport}
            />
          </Tooltip>

          <Tooltip content="Send test email">
            <Button
              className="pro-toolbar-btn"
              icon={<IconSend />}
              onClick={() => setSendDialogVisible(true)}
            />
          </Tooltip>

          <Dropdown
            droplist={
              <Menu>
                <Menu.Item key="mjml" onClick={onExportMJML}>
                  Export MJML
                </Menu.Item>
                <Menu.Item key="html" onClick={onExportHTML}>
                  Export HTML
                </Menu.Item>
                <Menu.Item key="json" onClick={onExportJSON}>
                  Export JSON
                </Menu.Item>
              </Menu>
            }
          >
            <Button className="pro-toolbar-btn-accent" icon={<IconExport />}>
              Export
            </Button>
          </Dropdown>

          <Button
            className="pro-toolbar-btn-primary"
            icon={<IconSave />}
            loading={saving}
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>

      {/* Send Test Email Dialog */}
      <Modal
        title="Send Test Email"
        visible={sendDialogVisible}
        onCancel={() => setSendDialogVisible(false)}
        onOk={handleSendTest}
        confirmLoading={sending}
        okText="Send"
      >
        <p style={{ marginBottom: 12, color: "#666" }}>
          Send a test email to preview how your template looks in real email
          clients.
        </p>
        <Input
          placeholder="Enter email address"
          value={testEmail}
          onChange={setTestEmail}
          onPressEnter={handleSendTest}
        />
      </Modal>
    </>
  );
}
