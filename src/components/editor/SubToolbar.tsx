import React, { useMemo, useState, useCallback } from "react";
import { Tooltip, Modal, Message } from "@arco-design/web-react";
import {
  IconDesktop,
  IconMobile,
  IconEdit,
  IconEye,
  IconDelete,
  IconUndo,
  IconRedo,
  IconEmail,
} from "@arco-design/web-react/icon";
import {
  useBlock,
  useActiveTab,
  useFocusIdx,
  ActiveTabKeys,
  IEmailTemplate,
} from "easy-email-editor";
import { BasicType, BlockManager, JsonToMjml } from "easy-email-core";
import mjml from "mjml-browser";

interface SubToolbarProps {
  values: IEmailTemplate;
  onPreview?: () => void;
}

// Gmail clips emails larger than 102KB
const GMAIL_CLIP_SIZE = 102 * 1024;

export default function SubToolbar({ values, onPreview }: SubToolbarProps) {
  const { undo, redo, undoable, redoable, removeBlock } = useBlock();
  const { activeTab, setActiveTab } = useActiveTab();
  const { focusIdx, setFocusIdx } = useFocusIdx();
  const [previewMode, setPreviewMode] = useState(false);

  // Calculate the email HTML size (approximate)
  const emailSize = useMemo(() => {
    try {
      const mjmlString = JsonToMjml({
        data: values.content,
        mode: "production",
        context: values.content,
        dataSource: {},
      });
      const { html } = mjml(mjmlString, {
        validationLevel: "soft",
        minify: true,
      });
      return new Blob([html]).size;
    } catch {
      return 0;
    }
  }, [values.content]);

  const sizeKB = (emailSize / 1024).toFixed(1);
  const sizePercent = Math.min((emailSize / GMAIL_CLIP_SIZE) * 100, 100);
  const isOverLimit = emailSize > GMAIL_CLIP_SIZE;
  const isNearLimit = emailSize > GMAIL_CLIP_SIZE * 0.8;

  const isEditMode = activeTab === ActiveTabKeys.EDIT;
  const isDesktopMode = activeTab === ActiveTabKeys.PC;
  const isMobileMode = activeTab === ActiveTabKeys.MOBILE;

  const handleDelete = useCallback(() => {
    Modal.confirm({
      title: "Clear Canvas",
      content: "Are you sure you want to delete all blocks?",
      okButtonProps: { status: "danger" },
      onOk: () => {
        const pageBlock = BlockManager.getBlockByType(BasicType.PAGE);
        if (pageBlock) {
          const emptyPage = pageBlock.create({
            children: [],
          });
        }
        setFocusIdx("content");
        const childrenCount = values.content?.children?.length || 0;
        for (let i = 0; i < childrenCount; i++) {
          removeBlock(`content.children.[0]`);
        }
        Message.success("All blocks have been deleted");
      },
    });
  }, [values.content, removeBlock, setFocusIdx]);

  const togglePreview = useCallback(() => {
    const next = !previewMode;
    setPreviewMode(next);
    const editorBody = document.querySelector(".pro-editor-body");
    if (editorBody) {
      editorBody.classList.toggle("pro-preview-mode", next);
    }
  }, [previewMode]);

  return (
    <div className="sticky top-0 z-50 flex h-[60px] w-full shrink-0 items-center justify-between border-b border-gray-200 bg-white text-black px-3 box-border">
      <div className="font-bold text-black">page</div>

      {/* Device toggle group */}
      <div className="flex items-center p-0.5 gap-0">
        <div className="flex items-center">
          <button
            className={`flex items-center gap-1.5 h-8 px-8 rounded-l-sm text-sm font-medium border border-black bg-transparent transition-all duration-150 cursor-pointer ${
              activeTab === ActiveTabKeys.EDIT
                ? "z-20 bg-white text-blue-500 border border-blue-500 shadow-sm"
                : " text-black hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab(ActiveTabKeys.EDIT)}
          >
            Edit
            <IconEdit className="w-4 h-4" />
          </button>
          <button
            className={`flex items-center gap-1.5 h-8 px-8 -ml-px text-sm font-medium border border-black bg-transparent transition-all duration-150 cursor-pointer ${
              activeTab === ActiveTabKeys.PC
                ? "z-20 bg-white text-blue-500 border border-blue-500 shadow-sm"
                : " text-black hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab(ActiveTabKeys.PC)}
          >
            Desktop
            <IconDesktop className="w-4 h-4" />
          </button>
          <button
            className={`flex items-center gap-1.5 h-8 px-8 rounded-r-sm -ml-px text-sm font-medium border border-black bg-transparent transition-all duration-150 cursor-pointer ${
              activeTab === ActiveTabKeys.MOBILE
                ? "z-20 bg-white text-blue-500 border border-blue-500 shadow-sm"
                : " text-black hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab(ActiveTabKeys.MOBILE)}
          >
            <IconMobile className="w-4 h-4" />
            Mobile
          </button>
        </div>
      </div>

      {/* Email size */}
      <div className="flex items-center gap-2">
        <div className=" flex items-center gap-2 text-sm font-medium text-gray-700">
          <span className="flex items-center gap-1 whitespace-nowrap font-medium text-[#4e5969]">
            <IconEmail className="inline-block w-4 h-4" />
            Email size:
          </span>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverLimit
                  ? "bg-red-500"
                  : isNearLimit
                    ? "bg-yellow-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${sizePercent}%` }}
            />
          </div>
          <span
            className={`whitespace-nowrap tabular-nums ${
              isOverLimit
                ? "font-semibold text-red-500"
                : isNearLimit
                  ? "text-yellow-500"
                  : "text-gray-500"
            }`}
          >
            {sizeKB} KB / 102 KB
          </span>
        </div>
        {/* Delete */}
        <div className="flex items-center gap-1.5">
          <Tooltip position="top" content="Clear the entire canvas">
            <button
              className="flex items-center justify-center rounded px-5 py-[6px] border border-black text-black transition-all duration-150 cursor-pointer"
              onClick={handleDelete}
            >
              <IconDelete className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
        {/* Right — Preview */}
        <div className="flex items-center gap-1.5">
          <Tooltip position="top" content="Email preview">
            <button
              className="flex items-center justify-center rounded px-5 py-[6px] border border-black text-black transition-all duration-150 cursor-pointer hover:bg-gray-100 hover:text-gray-700 
              "
              onClick={onPreview}
            >
              <IconEye className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
