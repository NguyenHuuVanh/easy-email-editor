import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Tabs,
  Input,
  Collapse,
  Slider,
  Select,
  ColorPicker,
  InputNumber,
  Switch,
  Button,
  Space,
  Empty,
} from "@arco-design/web-react";
import {
  IconSearch,
  IconSettings,
  IconApps,
  IconList,
  IconFontColors,
} from "@arco-design/web-react/icon";
import { BlockLayer } from "easy-email-extensions";
import {
  useFocusIdx,
  useBlock,
  useEditorContext,
  useEditorProps,
} from "easy-email-editor";
import { AdvancedType, BasicType } from "easy-email-core";

const TabPane = Tabs.TabPane;
const CollapseItem = Collapse.Item;

// ====== LAYERS TAB ======
export function LayersTab() {
  return (
    <div className="pro-sidebar-panel">
      <div className="pro-sidebar-panel-header">
        <IconList style={{ marginRight: 6 }} />
        <span>Layers</span>
      </div>
      <div className="pro-layers-container">
        <BlockLayer
          renderTitle={(block) => {
            const title =
              block.data?.value?.content
                ?.replace(/<[^>]*>/g, "")
                ?.slice(0, 30) ||
              block.type?.replace(/_/g, " ")?.replace("advanced ", "") ||
              "Block";
            return (
              <span className="pro-layer-title" title={title}>
                {title}
              </span>
            );
          }}
        />
      </div>
    </div>
  );
}

// ====== SETTINGS TAB ======
export function SettingsTab() {
  const { formHelpers, pageData } = useEditorContext();
  const { focusIdx } = useFocusIdx();

  const [subject, setSubject] = useState(
    () => (formHelpers as any)?.getState?.()?.values?.subject || "New Template",
  );
  const [subtitle, setSubtitle] = useState(
    () =>
      (formHelpers as any)?.getState?.()?.values?.subTitle || "New Template",
  );

  const updatePageAttribute = useCallback(
    (path: string, value: any) => {
      formHelpers.change(path, value);
    },
    [formHelpers],
  );

  const pageAttributes = pageData?.attributes || {};
  const pageData_value = pageData?.data?.value || {};

  return (
    <div className="pro-sidebar-panel">
      <div className="pro-sidebar-panel-header">
        <IconSettings style={{ marginRight: 6 }} />
        <span>Page Settings</span>
      </div>
      <div style={{ padding: "0 12px" }}>
        <Collapse
          defaultActiveKey={["email", "theme", "fonts"]}
          bordered={false}
        >
          <CollapseItem
            header="Email Settings"
            name="email"
            style={{ fontSize: 13 }}
          >
            <div className="pro-setting-row">
              <label>Subject</label>
              <Input
                size="small"
                value={subject}
                onChange={(val) => {
                  setSubject(val);
                  formHelpers.change("subject", val);
                }}
              />
            </div>
            <div className="pro-setting-row">
              <label>Subtitle</label>
              <Input
                size="small"
                value={subtitle}
                onChange={(val) => {
                  setSubtitle(val);
                  formHelpers.change("subTitle", val);
                }}
              />
            </div>
            <div className="pro-setting-row">
              <label>Width (px)</label>
              <Input
                size="small"
                value={pageAttributes.width || "600px"}
                onChange={(val) =>
                  updatePageAttribute("content.attributes.width", val)
                }
              />
            </div>
            <div className="pro-setting-row">
              <label>Breakpoint (px)</label>
              <Input
                size="small"
                value={pageAttributes.breakpoint || "480px"}
                onChange={(val) =>
                  updatePageAttribute("content.attributes.breakpoint", val)
                }
              />
            </div>
          </CollapseItem>

          <CollapseItem
            header="Theme Settings"
            name="theme"
            style={{ fontSize: 13 }}
          >
            <div className="pro-setting-row">
              <label>Font Family</label>
              <Select
                size="small"
                value={
                  pageData_value?.["font-family"] ||
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                }
                onChange={(val) =>
                  updatePageAttribute("content.data.value.font-family", val)
                }
              >
                <Select.Option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
                  System Default
                </Select.Option>
                <Select.Option value="Arial, Helvetica, sans-serif">
                  Arial
                </Select.Option>
                <Select.Option value="Georgia, serif">Georgia</Select.Option>
                <Select.Option value="'Times New Roman', serif">
                  Times New Roman
                </Select.Option>
                <Select.Option value="'Courier New', monospace">
                  Courier New
                </Select.Option>
                <Select.Option value="Verdana, Geneva, sans-serif">
                  Verdana
                </Select.Option>
                <Select.Option value="'Trebuchet MS', sans-serif">
                  Trebuchet MS
                </Select.Option>
              </Select>
            </div>
            <div className="pro-setting-row">
              <label>Font Size (px)</label>
              <InputNumber
                size="small"
                value={parseInt(pageData_value?.["font-size"] || "14")}
                min={10}
                max={24}
                onChange={(val) =>
                  updatePageAttribute(
                    "content.data.value.font-size",
                    `${val}px`,
                  )
                }
              />
            </div>
            <div className="pro-setting-row">
              <label>Line Height</label>
              <InputNumber
                size="small"
                step={0.1}
                value={parseFloat(pageData_value?.["line-height"] || "1.7")}
                min={1}
                max={3}
                onChange={(val) =>
                  updatePageAttribute(
                    "content.data.value.line-height",
                    `${val}`,
                  )
                }
              />
            </div>
            <div className="pro-setting-row">
              <label>Font Weight</label>
              <Select
                size="small"
                value={pageData_value?.["font-weight"] || "400"}
                onChange={(val) =>
                  updatePageAttribute("content.data.value.font-weight", val)
                }
              >
                <Select.Option value="300">Light (300)</Select.Option>
                <Select.Option value="400">Normal (400)</Select.Option>
                <Select.Option value="500">Medium (500)</Select.Option>
                <Select.Option value="600">Semi-Bold (600)</Select.Option>
                <Select.Option value="700">Bold (700)</Select.Option>
              </Select>
            </div>
            <div className="pro-setting-row">
              <label>Text Color</label>
              <Input
                size="small"
                value={pageData_value?.["text-color"] || "#000000"}
                onChange={(val) =>
                  updatePageAttribute("content.data.value.text-color", val)
                }
                addBefore={
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 2,
                      background: pageData_value?.["text-color"] || "#000000",
                      border: "1px solid #ddd",
                    }}
                  />
                }
              />
            </div>
            <div className="pro-setting-row">
              <label>Background</label>
              <Input
                size="small"
                value={pageAttributes?.["background-color"] || "#F5F7FA"}
                onChange={(val) =>
                  updatePageAttribute(
                    "content.attributes.background-color",
                    val,
                  )
                }
                addBefore={
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 2,
                      background:
                        pageAttributes?.["background-color"] || "#F5F7FA",
                      border: "1px solid #ddd",
                    }}
                  />
                }
              />
            </div>
          </CollapseItem>

          <CollapseItem
            header="Content Background"
            name="fonts"
            style={{ fontSize: 13 }}
          >
            <div className="pro-setting-row">
              <label>Content BG Color</label>
              <Input
                size="small"
                value={pageData_value?.["content-background-color"] || ""}
                placeholder="transparent"
                onChange={(val) =>
                  updatePageAttribute(
                    "content.data.value.content-background-color",
                    val,
                  )
                }
                addBefore={
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 2,
                      background:
                        pageData_value?.["content-background-color"] ||
                        "transparent",
                      border: "1px solid #ddd",
                    }}
                  />
                }
              />
            </div>
            <div className="pro-setting-row">
              <label>User Style (CSS)</label>
              <Input.TextArea
                style={{
                  fontSize: 11,
                  fontFamily: "monospace",
                  minHeight: 80,
                }}
                placeholder={`.custom-class {\n  color: red;\n}`}
                value={pageData_value?.["user-style"]?.content || ""}
                onChange={(val) =>
                  updatePageAttribute(
                    "content.data.value.user-style.content",
                    val,
                  )
                }
              />
            </div>
          </CollapseItem>
        </Collapse>
      </div>
    </div>
  );
}

// ====== SAVED BLOCKS TAB ======
interface SavedBlock {
  id: string;
  name: string;
  thumbnail?: string;
  data: any;
}

export function SavedBlocksTab() {
  const [savedBlocks, setSavedBlocks] = useState<SavedBlock[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("saved-email-blocks") || "[]");
    } catch {
      return [];
    }
  });

  const [search, setSearch] = useState("");

  const filtered = savedBlocks.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="pro-sidebar-panel">
      <div className="pro-sidebar-panel-header">
        <IconApps style={{ marginRight: 6 }} />
        <span>Saved Blocks</span>
      </div>
      <div style={{ padding: "8px 12px" }}>
        <Input
          allowClear
          placeholder="Search saved blocks..."
          prefix={<IconSearch />}
          value={search}
          onChange={setSearch}
          size="small"
          style={{ marginBottom: 8 }}
        />
      </div>
      <div
        style={{
          padding: "0 12px",
          flex: 1,
          overflow: "auto",
        }}
      >
        {filtered.length === 0 ? (
          <Empty
            description={
              <span style={{ fontSize: 12, color: "#999" }}>
                No saved blocks yet.
                <br />
                Right-click a block in the editor to save it.
              </span>
            }
            style={{ marginTop: 40 }}
          />
        ) : (
          <div className="pro-saved-blocks-grid">
            {filtered.map((block) => (
              <div key={block.id} className="pro-saved-block-item">
                <div className="pro-saved-block-thumb">
                  {block.thumbnail ? (
                    <img src={block.thumbnail} alt={block.name} />
                  ) : (
                    <IconApps style={{ fontSize: 24, color: "#bbb" }} />
                  )}
                </div>
                <span className="pro-saved-block-name">{block.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
