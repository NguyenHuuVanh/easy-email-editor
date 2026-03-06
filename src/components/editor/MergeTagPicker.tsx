import React, { useState } from "react";
import { Tree, Input, Tag } from "@arco-design/web-react";
import { IconSearch } from "@arco-design/web-react/icon";
import {
  mergeTagDefinitions as defaultDefinitions,
  mergeTagGenerate,
  MergeTagItem,
} from "@/data/merge-tags";

interface MergeTagPickerProps {
  onChange: (val: string) => void;
  value: string;
  isSelect: boolean;
  definitions?: MergeTagItem[];
}

interface TreeNodeData {
  title: string | React.ReactNode;
  key: string;
  children?: TreeNodeData[];
  isLeaf?: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  text: "blue",
  image: "green",
  link: "purple",
};

function buildTreeFromDefinitions(items: MergeTagItem[]): TreeNodeData[] {
  return items.map((item) => {
    if (item.children && item.children.length > 0) {
      return {
        title: item.label,
        key: item.value || item.label,
        children: buildTreeFromDefinitions(item.children),
      };
    }
    return {
      title: (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {item.label}
          {item.type && (
            <Tag
              size="small"
              color={TYPE_COLORS[item.type] || "gray"}
              style={{ fontSize: 10, lineHeight: "16px", padding: "0 4px" }}
            >
              {item.type}
            </Tag>
          )}
        </span>
      ),
      key: item.value,
      isLeaf: true,
    };
  });
}

function filterDefinitions(
  items: MergeTagItem[],
  search: string,
): MergeTagItem[] {
  if (!search) return items;
  return items
    .map((item) => {
      if (item.children) {
        const filtered = filterDefinitions(item.children, search);
        if (filtered.length > 0) return { ...item, children: filtered };
      }
      if (item.label.toLowerCase().includes(search.toLowerCase())) return item;
      if (item.value.toLowerCase().includes(search.toLowerCase())) return item;
      return null;
    })
    .filter(Boolean) as MergeTagItem[];
}

export default function MergeTagPicker({
  onChange,
  value,
  isSelect,
  definitions,
}: MergeTagPickerProps) {
  const [search, setSearch] = useState("");
  const defs = definitions || defaultDefinitions;

  const filtered = filterDefinitions(defs, search);
  const treeData = buildTreeFromDefinitions(filtered);
  const defaultExpanded = defs.map((d) => d.value || d.label);

  return (
    <div
      style={{
        padding: "8px",
        minWidth: 260,
        maxHeight: 400,
        overflow: "auto",
      }}
    >
      <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 13 }}>
        Insert Dynamic Variable
      </div>
      <Input
        allowClear
        placeholder="Search variables..."
        prefix={<IconSearch />}
        value={search}
        onChange={setSearch}
        style={{ marginBottom: 8 }}
        size="small"
      />
      <Tree
        treeData={treeData}
        defaultExpandedKeys={defaultExpanded}
        size="small"
        onSelect={(keys) => {
          if (keys.length > 0) {
            onChange(mergeTagGenerate(keys[0] as string));
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
