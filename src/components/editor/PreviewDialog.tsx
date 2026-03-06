import React, { useState, useMemo, useEffect } from "react";
import { Button, Message } from "@arco-design/web-react";
import {
  IconDesktop,
  IconMobile,
  IconClose,
} from "@arco-design/web-react/icon";
import { IEmailTemplate } from "easy-email-editor";
import { JsonToMjml } from "easy-email-core";
import mjml from "mjml-browser";
import DynamicDataDialog from "./DynamicDataDialog";
import {
  getValueByPath,
  MergeTagItem,
  mergeTagDefinitions,
} from "@/data/merge-tags";

interface PreviewDialogProps {
  visible: boolean;
  onClose: () => void;
  values: IEmailTemplate;
  mergeTagsData: Record<string, any>;
  onMergeTagsDataChange: (data: Record<string, any>) => void;
  definitions?: MergeTagItem[];
}

// Replace {{path}} merge tags in a string with actual values
function replaceMergeTagsInString(
  str: string,
  data: Record<string, any>,
): string {
  return str.replace(/\{\{([^}]+)\}\}/g, (_match, path: string) => {
    const value = getValueByPath(data, path.trim());
    return value !== undefined && value !== "" ? String(value) : _match;
  });
}

// Deep-walk any JSON value and replace {{path}} in all strings
function replaceInContent(obj: any, data: Record<string, any>): any {
  if (typeof obj === "string") {
    return replaceMergeTagsInString(obj, data);
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => replaceInContent(item, data));
  }
  if (typeof obj === "object" && obj !== null) {
    const result: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      result[key] = replaceInContent(obj[key], data);
    }
    return result;
  }
  return obj;
}

export default function PreviewDialog({
  visible,
  onClose,
  values,
  mergeTagsData,
  onMergeTagsDataChange,
  definitions,
}: PreviewDialogProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [editVarsVisible, setEditVarsVisible] = useState(false);
  const [animState, setAnimState] = useState<
    "entering" | "entered" | "exiting" | "exited"
  >(visible ? "entered" : "exited");

  useEffect(() => {
    if (visible) {
      // Opening: mount at off-screen position, then slide in
      setAnimState("entering");
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimState("entered"));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      // Closing: slide out, then unmount
      setAnimState("exiting");
      const timer = setTimeout(() => setAnimState("exited"), 350);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Generate HTML from template and replace merge tags
  const previewHtml = useMemo(() => {
    if (!values?.content) return "";
    try {
      // Replace merge tags in the content JSON BEFORE converting to MJML
      const replacedContent = replaceInContent(values.content, mergeTagsData);
      const mjmlString = JsonToMjml({
        data: replacedContent,
        mode: "production",
        context: replacedContent,
      });
      const { html } = mjml(mjmlString, {});
      // Also replace any remaining {{tags}} in the final HTML (fallback)
      return replaceMergeTagsInString(html, mergeTagsData);
    } catch (e) {
      console.error("Preview generation failed:", e);
      return "<p style='padding:20px;color:red;'>Failed to generate preview</p>";
    }
  }, [values, mergeTagsData]);

  if (!visible && animState === "exited") return null;

  const isOpen = animState === "entered";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 52,
          padding: "0 16px",
          background: "#fff",
          borderBottom: "1px solid #e8e8e8",
          flexShrink: 0,
        }}
      >
        {/* Left — Title */}
        <div style={{ fontSize: 15, fontWeight: 600, color: "#333" }}>
          Preview Mode
        </div>

        {/* Center — Device toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            background: "#f5f5f5",
            borderRadius: 8,
            padding: 3,
          }}
        >
          <Button
            size="small"
            icon={<IconDesktop />}
            style={{
              borderRadius: 6,
              background: device === "desktop" ? "#fff" : "transparent",
              boxShadow:
                device === "desktop" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              border: "none",
            }}
            onClick={() => setDevice("desktop")}
          >
            desktop
          </Button>
          <Button
            size="small"
            icon={<IconMobile />}
            style={{
              borderRadius: 6,
              background: device === "mobile" ? "#fff" : "transparent",
              boxShadow:
                device === "mobile" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              border: "none",
            }}
            onClick={() => setDevice("mobile")}
          >
            mobile
          </Button>
        </div>

        {/* Right — Edit variables + Done */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Button
            size="small"
            onClick={() => setEditVarsVisible(true)}
            style={{
              borderRadius: 6,
              border: "1px solid #d9d9d9",
            }}
          >
            Edit test variables
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={onClose}
            style={{ borderRadius: 6 }}
          >
            Done
          </Button>
        </div>
      </div>

      {/* Subject line */}
      <div
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid #e8e8e8",
          fontSize: 13,
          color: "#333",
          background: "#fafafa",
        }}
      >
        <span style={{ marginRight: 8, color: "#999" }}>📋 Subject:</span>
        {replaceMergeTagsInString(
          values.subject || "No subject",
          mergeTagsData,
        )}
      </div>

      {/* Email preview */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          background: "#f0f2f5",
          display: "flex",
          justifyContent: "center",
          padding: "20px 0",
        }}
      >
        <div
          style={{
            width: device === "desktop" ? 600 : 375,
            transition: "width 0.3s ease",
            background: "#fff",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            borderRadius: 4,
            overflow: "hidden",
            height: "fit-content",
          }}
        >
          <iframe
            srcDoc={previewHtml}
            style={{
              width: "100%",
              height: "100%",
              minHeight: "80vh",
              border: "none",
            }}
            title="Email Preview"
            sandbox="allow-same-origin"
          />
        </div>
      </div>

      {/* Dynamic Data Dialog — reuse existing component */}
      <DynamicDataDialog
        visible={editVarsVisible}
        onClose={() => setEditVarsVisible(false)}
        data={mergeTagsData}
        definitions={definitions || mergeTagDefinitions}
        onChange={onMergeTagsDataChange}
      />
    </div>
  );
}
