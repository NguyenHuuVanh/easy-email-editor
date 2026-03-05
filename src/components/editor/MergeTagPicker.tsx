import React, { useState } from "react";
import { Tree, Input } from "@arco-design/web-react";
import { IconSearch } from "@arco-design/web-react/icon";

interface MergeTagPickerProps {
  onChange: (val: string) => void;
  value: string;
  isSelect: boolean;
}

interface TreeNodeData {
  title: string;
  key: string;
  children?: TreeNodeData[];
  isLeaf?: boolean;
}

function buildTreeData(
  obj: Record<string, any>,
  parentKey = "",
): TreeNodeData[] {
  return Object.entries(obj).map(([key, value]) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return {
        title: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        key: fullKey,
        children: buildTreeData(value, fullKey),
      };
    }
    return {
      title: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      key: fullKey,
      isLeaf: true,
    };
  });
}

export default function MergeTagPicker({
  onChange,
  value,
  isSelect,
}: MergeTagPickerProps) {
  const [search, setSearch] = useState("");

  // Import merge tags
  const { mergeTags } = require("@/data/merge-tags");
  const treeData = buildTreeData(mergeTags);

  const filterTree = (nodes: TreeNodeData[]): TreeNodeData[] => {
    if (!search) return nodes;
    return nodes
      .map((node) => {
        if (node.children) {
          const filtered = filterTree(node.children);
          if (filtered.length > 0) return { ...node, children: filtered };
        }
        if (node.title.toLowerCase().includes(search.toLowerCase()))
          return node;
        return null;
      })
      .filter(Boolean) as TreeNodeData[];
  };

  return (
    <div
      style={{
        padding: "8px",
        minWidth: 240,
        maxHeight: 360,
        overflow: "auto",
      }}
    >
      <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 13 }}>
        Insert Merge Tag
      </div>
      <Input
        allowClear
        placeholder="Search tags..."
        prefix={<IconSearch />}
        value={search}
        onChange={setSearch}
        style={{ marginBottom: 8 }}
        size="small"
      />
      <Tree
        treeData={filterTree(treeData)}
        defaultExpandedKeys={treeData.map((n) => n.key)}
        size="small"
        onSelect={(keys) => {
          if (keys.length > 0) {
            onChange(keys[0] as string);
          }
        }}
        style={{ fontSize: 12 }}
      />
      {value && (
        <div
          style={{
            marginTop: 8,
            padding: "4px 8px",
            background: "#f0f5ff",
            borderRadius: 4,
            fontSize: 11,
            color: "#666",
          }}
        >
          Selected: <code>{`{{${value}}}`}</code>
        </div>
      )}
    </div>
  );
}
