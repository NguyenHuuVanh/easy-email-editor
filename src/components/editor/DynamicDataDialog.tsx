import React, { useState, useEffect } from "react";
import {
  Modal,
  Input,
  Collapse,
  Tag,
  Button,
  Message,
} from "@arco-design/web-react";
import {
  mergeTagDefinitions,
  MergeTagItem,
  getValueByPath,
  setValueByPath,
} from "@/data/merge-tags";

const CollapseItem = Collapse.Item;

const TYPE_COLORS: Record<string, string> = {
  text: "blue",
  image: "green",
  link: "purple",
};

interface DynamicDataDialogProps {
  visible: boolean;
  onClose: () => void;
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export default function DynamicDataDialog({
  visible,
  onClose,
  data,
  onChange,
}: DynamicDataDialogProps) {
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    if (visible) {
      setLocalData(data);
    }
  }, [visible, data]);

  const handleFieldChange = (path: string, value: string) => {
    setLocalData((prev) => setValueByPath(prev, path, value));
  };

  const handleSave = () => {
    onChange(localData);
    Message.success("Dynamic data updated!");
    onClose();
  };

  const renderFields = (items: MergeTagItem[]) => {
    return items.map((item) => {
      if (!item.value) return null;
      const currentValue = getValueByPath(localData, item.value);
      return (
        <div key={item.value} style={{ marginBottom: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <label style={{ fontSize: 12, fontWeight: 500, color: "#333" }}>
              {item.label}
            </label>
            {item.type && (
              <Tag
                size="small"
                color={TYPE_COLORS[item.type] || "gray"}
                style={{ fontSize: 10, lineHeight: "16px", padding: "0 4px" }}
              >
                {item.type}
              </Tag>
            )}
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <code
              style={{
                fontSize: 10,
                color: "#999",
                background: "#f5f5f5",
                padding: "2px 6px",
                borderRadius: 3,
                whiteSpace: "nowrap",
              }}
            >
              {`{{${item.value}}}`}
            </code>
            <Input
              size="small"
              value={currentValue}
              onChange={(val) => handleFieldChange(item.value, val)}
              placeholder={`Enter ${item.label.toLowerCase()}...`}
              style={{ flex: 1 }}
            />
          </div>
        </div>
      );
    });
  };

  return (
    <Modal
      title={
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>🔧</span> Edit Dynamic Variables
        </span>
      }
      visible={visible}
      onCancel={onClose}
      style={{ width: 560 }}
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleSave}>
            Apply Changes
          </Button>
        </div>
      }
    >
      <div style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
        Edit the values below to preview how your email will look with real
        data. These variables will replace{" "}
        <code
          style={{ background: "#f0f5ff", padding: "1px 4px", borderRadius: 3 }}
        >
          {"{{variable}}"}
        </code>{" "}
        placeholders in the template.
      </div>

      <Collapse
        defaultActiveKey={mergeTagDefinitions.map((d) => d.label)}
        bordered={false}
        style={{ maxHeight: 460, overflow: "auto" }}
      >
        {mergeTagDefinitions.map((group) => (
          <CollapseItem
            key={group.label}
            header={
              <span style={{ fontWeight: 600, fontSize: 13 }}>
                {group.label}
              </span>
            }
            name={group.label}
          >
            {group.children && renderFields(group.children)}
          </CollapseItem>
        ))}
      </Collapse>
    </Modal>
  );
}
