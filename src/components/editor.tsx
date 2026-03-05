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
import ImportDialog from "./editor/ImportDialog";
import MergeTagPicker from "./editor/MergeTagPicker";
import { LayersTab, SettingsTab, SavedBlocksTab } from "./editor/SidebarPanels";
import {
  registerCustomBlocks,
  QR_CODE_BLOCK_TYPE,
  VIDEO_BLOCK_TYPE,
  COUNTDOWN_BLOCK_TYPE,
} from "./editor/CustomBlocks";

// Data
import { mergeTags, mergeTagGenerate } from "@/data/merge-tags";
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
          height={"calc(100vh - 52px)"}
          data={initialValues}
          onUploadImage={onUploadImage}
          onSubmit={onSubmit}
          dashed={false}
          enabledLogic
          mergeTags={mergeTags}
          mergeTagGenerate={mergeTagGenerate}
          enabledMergeTagsBadge
          renderMergeTagContent={(props) => (
            <MergeTagPicker
              onChange={props.onChange}
              value={props.value}
              isSelect={props.isSelect}
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
                    <EmailEditor />
                  </StandardLayout>
                </div>

                {/* Import Dialog */}
                <ImportDialog
                  visible={importVisible}
                  onClose={() => setImportVisible(false)}
                />
              </>
            );
          }}
        </EmailEditorProvider>
      </div>
    </ConfigProvider>
  );
}
