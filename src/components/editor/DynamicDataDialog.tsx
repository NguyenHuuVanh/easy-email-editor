import React, { useState, useEffect } from "react";
import {
  Modal,
  Input,
  Collapse,
  Tag,
  Button,
  Message,
  Select,
  Popconfirm,
} from "@arco-design/web-react";
import {
  IconPlus,
  IconDelete,
  IconPlusCircle,
} from "@arco-design/web-react/icon";
import {
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
  definitions: MergeTagItem[];
  onChange: (data: Record<string, any>, definitions?: MergeTagItem[]) => void;
}

// Convert label to a valid key: "My Field" → "my_field"
function labelToKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

// Remove a dotted path from nested data
function removePath(
  obj: Record<string, any>,
  path: string,
): Record<string, any> {
  const clone = JSON.parse(JSON.stringify(obj));
  const keys = path.split(".");
  if (keys.length === 1) {
    delete clone[keys[0]];
    return clone;
  }
  let current = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) return clone;
    current = current[keys[i]];
  }
  delete current[keys[keys.length - 1]];
  return clone;
}

export default function DynamicDataDialog({
  visible,
  onClose,
  data,
  definitions,
  onChange,
}: DynamicDataDialogProps) {
  const [localData, setLocalData] = useState(data);
  const [localDefs, setLocalDefs] = useState<MergeTagItem[]>(definitions || []);

  // Add group form
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupLabel, setNewGroupLabel] = useState("");

  // Add field form (per group index)
  const [addFieldIdx, setAddFieldIdx] = useState<number | null>(null);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "image" | "link">(
    "text",
  );

  useEffect(() => {
    if (visible) {
      setLocalData(data);
      setLocalDefs(definitions || []);
      setShowAddGroup(false);
      setAddFieldIdx(null);
    }
  }, [visible, data, definitions]);

  const handleFieldChange = (path: string, value: string) => {
    setLocalData((prev) => setValueByPath(prev, path, value));
  };

  const handleSave = () => {
    onChange(localData, localDefs);
    Message.success("Dynamic data updated!");
    onClose();
  };

  // ---- Add Group ----
  const handleAddGroup = () => {
    const label = newGroupLabel.trim();
    if (!label) return;
    const key = labelToKey(label);
    if (localDefs.some((g) => labelToKey(g.label) === key)) {
      Message.warning("Group already exists");
      return;
    }
    setLocalDefs((prev) => [...prev, { label, value: "", children: [] }]);
    // Init empty object in data
    setLocalData((prev) => ({ ...prev, [key]: {} }));
    setNewGroupLabel("");
    setShowAddGroup(false);
  };

  // ---- Delete Group ----
  const handleDeleteGroup = (groupIdx: number) => {
    const group = localDefs[groupIdx];
    const groupKey = labelToKey(group.label);
    setLocalDefs((prev) => prev.filter((_, i) => i !== groupIdx));
    setLocalData((prev) => {
      const clone = JSON.parse(JSON.stringify(prev));
      delete clone[groupKey];
      return clone;
    });
  };

  // ---- Add Field to Group ----
  const handleAddField = (groupIdx: number) => {
    const label = newFieldLabel.trim();
    if (!label) return;
    const group = localDefs[groupIdx];
    const groupKey = labelToKey(group.label);
    const fieldKey = labelToKey(label);
    const path = `${groupKey}.${fieldKey}`;

    // Check duplicate
    if (group.children?.some((c) => c.value === path)) {
      Message.warning("Field already exists in this group");
      return;
    }

    const newField: MergeTagItem = {
      label,
      value: path,
      type: newFieldType,
    };

    setLocalDefs((prev) =>
      prev.map((g, i) =>
        i === groupIdx
          ? { ...g, children: [...(g.children || []), newField] }
          : g,
      ),
    );
    // Init default value
    setLocalData((prev) => setValueByPath(prev, path, ""));
    setNewFieldLabel("");
    setNewFieldType("text");
    setAddFieldIdx(null);
  };

  // ---- Delete Field ----
  const handleDeleteField = (groupIdx: number, fieldValue: string) => {
    setLocalDefs((prev) =>
      prev.map((g, i) =>
        i === groupIdx
          ? {
              ...g,
              children: g.children?.filter((c) => c.value !== fieldValue),
            }
          : g,
      ),
    );
    setLocalData((prev) => removePath(prev, fieldValue));
  };

  const renderFields = (items: MergeTagItem[], groupIdx: number) => {
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
            <Popconfirm
              title="Delete this field?"
              onOk={() => handleDeleteField(groupIdx, item.value)}
              okText="Delete"
              cancelText="Cancel"
            >
              <IconDelete
                style={{
                  fontSize: 13,
                  color: "#999",
                  cursor: "pointer",
                  marginLeft: "auto",
                }}
              />
            </Popconfirm>
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
        defaultActiveKey={localDefs.map((d) => d.label)}
        bordered={false}
        style={{ maxHeight: 400, overflow: "auto" }}
      >
        {localDefs.map((group, groupIdx) => (
          <CollapseItem
            key={group.label}
            header={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 13 }}>
                  {group.label}
                </span>
                <div
                  style={{ display: "flex", gap: 4 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="mini"
                    type="text"
                    icon={<IconPlusCircle />}
                    style={{ color: "#4f6ef7", fontSize: 12 }}
                    onClick={() => {
                      setAddFieldIdx(
                        addFieldIdx === groupIdx ? null : groupIdx,
                      );
                      setNewFieldLabel("");
                    }}
                  />
                  <Popconfirm
                    title={`Delete group "${group.label}" and all its fields?`}
                    onOk={() => handleDeleteGroup(groupIdx)}
                    okText="Delete"
                    cancelText="Cancel"
                  >
                    <Button
                      size="mini"
                      type="text"
                      icon={<IconDelete />}
                      style={{ color: "#f53f3f", fontSize: 12 }}
                    />
                  </Popconfirm>
                </div>
              </div>
            }
            name={group.label}
          >
            {group.children && renderFields(group.children, groupIdx)}

            {/* Add field inline form */}
            {addFieldIdx === groupIdx && (
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  marginTop: 8,
                  padding: "8px",
                  background: "#f7f8fa",
                  borderRadius: 6,
                }}
              >
                <Input
                  size="small"
                  placeholder="Field label..."
                  value={newFieldLabel}
                  onChange={setNewFieldLabel}
                  style={{ flex: 1 }}
                  onPressEnter={() => handleAddField(groupIdx)}
                />
                <Select
                  size="small"
                  value={newFieldType}
                  onChange={(v) => setNewFieldType(v as any)}
                  style={{ width: 85 }}
                >
                  <Select.Option value="text">text</Select.Option>
                  <Select.Option value="image">image</Select.Option>
                  <Select.Option value="link">link</Select.Option>
                </Select>
                <Button
                  size="small"
                  type="primary"
                  onClick={() => handleAddField(groupIdx)}
                  disabled={!newFieldLabel.trim()}
                >
                  Add
                </Button>
                <Button size="small" onClick={() => setAddFieldIdx(null)}>
                  ✕
                </Button>
              </div>
            )}
          </CollapseItem>
        ))}
      </Collapse>

      {/* Add Group */}
      <div style={{ marginTop: 12 }}>
        {showAddGroup ? (
          <div
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
              padding: "8px 12px",
              background: "#f7f8fa",
              borderRadius: 6,
            }}
          >
            <Input
              size="small"
              placeholder="Group name (e.g. Product, Event)..."
              value={newGroupLabel}
              onChange={setNewGroupLabel}
              style={{ flex: 1 }}
              onPressEnter={handleAddGroup}
            />
            <Button
              size="small"
              type="primary"
              onClick={handleAddGroup}
              disabled={!newGroupLabel.trim()}
            >
              Add Group
            </Button>
            <Button size="small" onClick={() => setShowAddGroup(false)}>
              ✕
            </Button>
          </div>
        ) : (
          <Button
            long
            size="small"
            type="dashed"
            icon={<IconPlus />}
            onClick={() => setShowAddGroup(true)}
            style={{ color: "#4f6ef7", borderColor: "#4f6ef7" }}
          >
            Add Variable Group
          </Button>
        )}
      </div>
    </Modal>
  );
}
