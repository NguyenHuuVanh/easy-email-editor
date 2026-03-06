import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { ConfigProvider, Message, Spin } from "@arco-design/web-react";
import {
  EmailEditor,
  EmailEditorProvider,
  IEmailTemplate,
  ActiveTabKeys,
  AvailableTools,
} from "easy-email-editor";

import { AdvancedType, JsonToMjml } from "easy-email-core";
import { StandardLayout } from "easy-email-extensions";

import "@arco-themes/react-easy-email-theme/css/arco.css";
import "easy-email-editor/lib/style.css";
import "easy-email-extensions/lib/style.css";

import enUS from "@arco-design/web-react/es/locale/en-US";
import { useRouter, useSearchParams } from "next/navigation";

// Custom components
import TopToolbar from "./editor/TopToolbar";
import SubToolbar from "./editor/SubToolbar";
import ImportDialog from "./editor/ImportDialog";
import DynamicDataDialog from "./editor/DynamicDataDialog";
import PreviewDialog from "./editor/PreviewDialog";
import MergeTagPicker from "./editor/MergeTagPicker";
import { LayersTab, SettingsTab, SavedBlocksTab } from "./editor/SidebarPanels";
import {
  registerCustomBlocks,
  QR_CODE_BLOCK_TYPE,
  VIDEO_BLOCK_TYPE,
  COUNTDOWN_BLOCK_TYPE,
} from "./editor/CustomBlocks";

// Data
import {
  mergeTags,
  mergeTagGenerate,
  mergeTagDefinitions as defaultDefinitions,
  defaultMergeTagsData,
  MergeTagItem,
} from "@/data/merge-tags";
import { uploadImage, saveTemplate } from "@/services/image-upload";

// Register custom blocks on module load
let blocksRegistered = false;
if (!blocksRegistered) {
  try {
    registerCustomBlocks();
    blocksRegistered = true;
  } catch (e) {
    // Already registered
  }
}

export default function Editor() {
  const [template, setTemplate] = useState<IEmailTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [dynamicDataVisible, setDynamicDataVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [mergeTagsData, setMergeTagsData] = useState(defaultMergeTagsData);
  const [definitions, setDefinitions] =
    useState<MergeTagItem[]>(defaultDefinitions);
  const [mergeTagsVersion, setMergeTagsVersion] = useState(0);
  const [zoom, setZoom] = useState(100);
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);

  const searchParams = useSearchParams();
  const id = searchParams?.get("id") || "1";
  const router = useRouter();

  // Image upload handler — connects to backend with blob fallback
  const onUploadImage = useCallback(async (blob: Blob) => {
    try {
      const url = await uploadImage(blob);
      return url;
    } catch {
      return URL.createObjectURL(blob);
    }
  }, []);

  // Load template
  useEffect(() => {
    setLoading(true);

    // Try to load from localStorage first (autosaved)
    const saved = localStorage.getItem(`email-template-${id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTemplate(parsed);
        setLoading(false);
        return;
      } catch {
        // Fall through to file loading
      }
    }

    import(`../data/template${id}.json`)
      .then((data) => {
        const templateContent = data.content;
        setTemplate({
          content: templateContent,
          subject: "New Template",
          subTitle: "New Template",
        });
      })
      .catch((err) => {
        console.error("Failed to load template:", err);
        Message.error("Failed to load template");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Autosave every 30 seconds
  const setupAutosave = useCallback(
    (values: IEmailTemplate) => {
      if (autosaveTimer.current) {
        clearInterval(autosaveTimer.current);
      }
      autosaveTimer.current = setInterval(() => {
        localStorage.setItem(`email-template-${id}`, JSON.stringify(values));
      }, 30000);
    },
    [id],
  );

  useEffect(() => {
    return () => {
      if (autosaveTimer.current) {
        clearInterval(autosaveTimer.current);
      }
    };
  }, []);

  // Inject styles into Shadow DOM for Page styling (padding-top: 0, purple border)
  useEffect(() => {
    const STYLE_ID = "pro-shadow-style";

    const applyStyles = () => {
      const visualEditor = document.getElementById("VisualEditorEditMode");
      if (!visualEditor) return false;
      const shadowRoot = visualEditor.shadowRoot;
      if (!shadowRoot) return false;

      // Inject <style> into shadow root
      if (!shadowRoot.getElementById(STYLE_ID)) {
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = `
          .shadow-container.easy-email-sync-scroll {
            padding: 0px !important;
            margin-top: 0px !important;
            background-color: #dddfe5 !important;
          }
          .shadow-container.easy-email-sync-scroll > div {
            border: 2px solid #7c3aed !important;
            position: relative;
          }
        `;
        shadowRoot.appendChild(style);
      }

      // Also directly override inline styles on the container
      const container = shadowRoot.querySelector(
        ".shadow-container.easy-email-sync-scroll",
      ) as HTMLElement;
      if (container) {
        container.style.setProperty("padding-top", "0px", "important");
        container.style.setProperty("margin-top", "0px", "important");
        return true;
      }
      return false;
    };

    // Observe until shadow DOM + container are ready
    let done = applyStyles();
    if (!done) {
      const observer = new MutationObserver(() => {
        if (applyStyles()) {
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });

      // Also poll briefly since shadow DOM mutations may not bubble
      const interval = setInterval(() => {
        if (applyStyles()) {
          clearInterval(interval);
          observer.disconnect();
        }
      }, 300);

      return () => {
        observer.disconnect();
        clearInterval(interval);
      };
    }
  }, []);

  const initialValues: IEmailTemplate | null = useMemo(() => {
    if (!template) return null;
    return template;
  }, [template]);

  const onSubmit = useCallback(
    async (values: IEmailTemplate) => {
      console.log("Submit:", values);
      localStorage.setItem(`email-template-${id}`, JSON.stringify(values));
      Message.success("Template saved!");
    },
    [id],
  );

  // StandardLayout categories — sidebar tabs
  const categories = useMemo(
    () => [
      {
        label: "Content",
        active: true,
        displayType: "grid" as const,
        blocks: [
          {
            type: AdvancedType.TEXT,
            title: "Text",
          },
          {
            type: AdvancedType.IMAGE,
            title: "Image",
          },
          {
            type: AdvancedType.BUTTON,
            title: "Button",
          },
          {
            type: AdvancedType.DIVIDER,
            title: "Divider",
          },
          {
            type: AdvancedType.SPACER,
            title: "Spacer",
          },
          {
            type: AdvancedType.NAVBAR,
            title: "Navbar",
          },
          {
            type: AdvancedType.SOCIAL,
            title: "Social",
          },
          {
            type: AdvancedType.HERO,
            title: "Hero",
          },
          {
            type: AdvancedType.TABLE,
            title: "Table",
          },
          {
            type: AdvancedType.CAROUSEL,
            title: "Carousel",
          },
          {
            type: AdvancedType.ACCORDION,
            title: "Accordion",
          },
          {
            type: AdvancedType.SECTION,
            title: "Section",
          },
          {
            type: AdvancedType.COLUMN,
            title: "Column",
          },
          {
            type: AdvancedType.GROUP,
            title: "Group",
          },
          {
            type: AdvancedType.WRAPPER,
            title: "Wrapper",
          },
          {
            type: QR_CODE_BLOCK_TYPE,
            title: "QR Code",
          },
          {
            type: VIDEO_BLOCK_TYPE,
            title: "Video",
          },
          {
            type: COUNTDOWN_BLOCK_TYPE,
            title: "Countdown",
          },
        ],
      },
      {
        label: "Blocks",
        displayType: "custom" as const,
        blocks: [<SavedBlocksTab key="saved-blocks" />],
      },
      {
        label: "Layers",
        displayType: "custom" as const,
        blocks: [<LayersTab key="layers" />],
      },
      {
        label: "Settings",
        displayType: "custom" as const,
        blocks: [<SettingsTab key="settings" />],
      },
    ],
    [],
  );

  if (!initialValues) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f2f5",
        }}
      >
        <Spin size={40} tip="Loading template..." />
      </div>
    );
  }

  return (
    <ConfigProvider locale={enUS}>
      <div className="pro-editor-container">
        <EmailEditorProvider
          key={`editor-${mergeTagsVersion}`}
          height={"calc(100vh - 52px)"}
          data={initialValues}
          onUploadImage={onUploadImage}
          onSubmit={onSubmit}
          dashed={false}
          enabledLogic
          mergeTags={mergeTagsData}
          mergeTagGenerate={mergeTagGenerate}
          enabledMergeTagsBadge
          renderMergeTagContent={(props) => (
            <MergeTagPicker
              onChange={props.onChange}
              value={props.value}
              isSelect={props.isSelect}
              definitions={definitions}
            />
          )}
          toolbar={{
            tools: [
              AvailableTools.Bold,
              AvailableTools.Italic,
              AvailableTools.Underline,
              AvailableTools.StrikeThrough,
              AvailableTools.FontFamily,
              AvailableTools.FontSize,
              AvailableTools.IconFontColor,
              AvailableTools.IconBgColor,
              AvailableTools.Link,
              AvailableTools.Justify,
              AvailableTools.Lists,
              AvailableTools.HorizontalRule,
              AvailableTools.MergeTags,
              AvailableTools.RemoveFormat,
            ],
          }}
          interactiveStyle={{
            hoverColor: "#4f6ef7",
            selectedColor: "#4f6ef7",
            dragoverColor: "#e8f0fe",
            tangentColor: "#ff6b6b",
          }}
          fontList={[
            { value: "Arial", label: "Arial" },
            { value: "Georgia", label: "Georgia" },
            { value: "Helvetica", label: "Helvetica" },
            { value: "Lucida Grande", label: "Lucida Grande" },
            { value: "Tahoma", label: "Tahoma" },
            { value: "Times New Roman", label: "Times New Roman" },
            { value: "Trebuchet MS", label: "Trebuchet MS" },
            { value: "Verdana", label: "Verdana" },
            {
              value: "'Courier New', Courier, monospace",
              label: "Courier New",
            },
            {
              value:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              label: "System Default",
            },
          ]}
        >
          {({ values }, { submit, restart }) => {
            // Setup autosave on values change
            setupAutosave(values);

            return (
              <>
                {/* Top Toolbar */}
                <TopToolbar
                  values={values}
                  onBack={() => router.push("/")}
                  onImport={() => setImportVisible(true)}
                  onEditVariables={() => setDynamicDataVisible(true)}
                  onPreview={() => setPreviewVisible(true)}
                  templateId={id}
                  zoom={zoom}
                  onZoomChange={setZoom}
                />

                {/* Editor Body with StandardLayout */}
                <div
                  className="pro-editor-body"
                  style={
                    zoom !== 100
                      ? {
                          transform: `scale(${zoom / 100})`,
                          transformOrigin: "top center",
                          height: `calc((100vh - 52px) * ${100 / zoom})`,
                        }
                      : undefined
                  }
                >
                  <StandardLayout
                    categories={categories}
                    showSourceCode={true}
                    compact={false}
                  >
                    <SubToolbar
                      values={values}
                      onPreview={() => setPreviewVisible(true)}
                    />
                    <EmailEditor />
                  </StandardLayout>
                </div>

                {/* Import Dialog */}
                <ImportDialog
                  visible={importVisible}
                  onClose={() => setImportVisible(false)}
                />

                {/* Dynamic Data Dialog */}
                <DynamicDataDialog
                  visible={dynamicDataVisible}
                  onClose={() => setDynamicDataVisible(false)}
                  data={mergeTagsData}
                  definitions={definitions}
                  onChange={(newData, newDefs) => {
                    setTemplate(values);
                    setMergeTagsData(newData);
                    if (newDefs) setDefinitions(newDefs);
                    setMergeTagsVersion((v) => v + 1);
                  }}
                />

                {/* Preview Dialog */}
                <PreviewDialog
                  visible={previewVisible}
                  onClose={() => setPreviewVisible(false)}
                  values={values}
                  mergeTagsData={mergeTagsData}
                  definitions={definitions}
                  onMergeTagsDataChange={(newData) => {
                    setMergeTagsData(newData);
                  }}
                />
              </>
            );
          }}
        </EmailEditorProvider>
      </div>
    </ConfigProvider>
  );
}
