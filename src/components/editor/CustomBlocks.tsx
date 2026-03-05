import React, { useMemo } from "react";
import {
  createCustomBlock,
  BasicType,
  AdvancedType,
  BlockManager,
  IBlockData,
} from "easy-email-core";
import { BlockAttributeConfigurationManager } from "easy-email-extensions";

// =============================================================
// CUSTOM BLOCK: QR Code
// =============================================================
const QR_CODE_BLOCK_TYPE = "custom_qr_code" as any;

const QrCodeBlock = createCustomBlock({
  name: "QR Code",
  type: QR_CODE_BLOCK_TYPE,
  validParentType: [
    BasicType.COLUMN,
    AdvancedType.COLUMN,
    BasicType.HERO,
    AdvancedType.HERO,
    BasicType.SECTION,
  ],
  create: (payload) => {
    return {
      type: QR_CODE_BLOCK_TYPE,
      data: {
        value: {
          url: "https://example.com",
          size: 200,
        },
      },
      attributes: {
        "css-class": "custom-qr-code",
        align: "center",
        padding: "10px 25px 10px 25px",
      },
      children: [],
      ...payload,
    } as any;
  },
  render: (params: any) => {
    const { data } = params;
    const url = data?.data?.value?.url || "https://example.com";
    const size = data?.data?.value?.size || 200;
    const padding = data?.attributes?.padding || "10px 25px";
    const align = data?.attributes?.align || "center";
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
    return `<mj-section padding="0"><mj-column><mj-image src="${qrUrl}" width="${size}px" align="${align}" padding="${padding}" /></mj-column></mj-section>`;
  },
});

// =============================================================
// CUSTOM BLOCK: Video
// =============================================================
const VIDEO_BLOCK_TYPE = "custom_video" as any;

const VideoBlock = createCustomBlock({
  name: "Video",
  type: VIDEO_BLOCK_TYPE,
  validParentType: [
    BasicType.COLUMN,
    AdvancedType.COLUMN,
    BasicType.HERO,
    AdvancedType.HERO,
    BasicType.SECTION,
  ],
  create: (payload) => {
    return {
      type: VIDEO_BLOCK_TYPE,
      data: {
        value: {
          src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          thumbnail: "",
          width: "100%",
        },
      },
      attributes: {
        "css-class": "custom-video",
        align: "center",
        padding: "10px 25px 10px 25px",
      },
      children: [],
      ...payload,
    } as any;
  },
  render: (params: any) => {
    const { data } = params;
    const src = data?.data?.value?.src || "";
    const thumbnail = data?.data?.value?.thumbnail || "";
    const padding = data?.attributes?.padding || "10px 25px";
    // Extract YouTube video ID for thumbnail
    const ytMatch = src.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?#]+)/,
    );
    const thumbUrl =
      thumbnail ||
      (ytMatch
        ? `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`
        : "https://via.placeholder.com/600x340?text=Video");
    return `<mj-section padding="0"><mj-column><mj-image src="${thumbUrl}" href="${src}" padding="${padding}" alt="Play Video" /><mj-text align="center" padding="4px 25px" font-size="12px" color="#666">Click to play video</mj-text></mj-column></mj-section>`;
  },
});

// =============================================================
// CUSTOM BLOCK: Countdown
// =============================================================
const COUNTDOWN_BLOCK_TYPE = "custom_countdown" as any;

const CountdownBlock = createCustomBlock({
  name: "Countdown",
  type: COUNTDOWN_BLOCK_TYPE,
  validParentType: [
    BasicType.COLUMN,
    AdvancedType.COLUMN,
    BasicType.HERO,
    AdvancedType.HERO,
    BasicType.SECTION,
  ],
  create: (payload) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    return {
      type: COUNTDOWN_BLOCK_TYPE,
      data: {
        value: {
          targetDate: tomorrow.toISOString().split("T")[0],
          textColor: "#ffffff",
          backgroundColor: "#1a1a2e",
        },
      },
      attributes: {
        "css-class": "custom-countdown",
        align: "center",
        padding: "10px 25px 10px 25px",
      },
      children: [],
      ...payload,
    } as any;
  },
  render: (params: any) => {
    const { data } = params;
    const targetDate =
      data?.data?.value?.targetDate || new Date().toISOString().split("T")[0];
    const textColor = data?.data?.value?.textColor || "#ffffff";
    const bgColor = data?.data?.value?.backgroundColor || "#1a1a2e";
    const padding = data?.attributes?.padding || "10px 25px";
    return `<mj-section padding="0"><mj-column><mj-text align="center" padding="${padding}" color="${textColor}" background-color="${bgColor}" font-size="24px" font-weight="bold">Countdown to ${targetDate}</mj-text><mj-text align="center" padding="4px 25px" color="${textColor}" background-color="${bgColor}" font-size="14px">Don't miss out!</mj-text></mj-column></mj-section>`;
  },
});

/**
 * Register all custom blocks globally.
 * Call this once before the editor mounts.
 */
export function registerCustomBlocks() {
  // Register block definitions
  BlockManager.registerBlocks({
    [QR_CODE_BLOCK_TYPE]: QrCodeBlock as any,
    [VIDEO_BLOCK_TYPE]: VideoBlock as any,
    [COUNTDOWN_BLOCK_TYPE]: CountdownBlock as any,
  });

  // Register property panels in the attribute configuration manager
  BlockAttributeConfigurationManager.add({
    [QR_CODE_BLOCK_TYPE]: QrCodePanel as any,
    [VIDEO_BLOCK_TYPE]: VideoPanel as any,
    [COUNTDOWN_BLOCK_TYPE]: CountdownPanel as any,
  });
}

// =============================================================
// Property Panels (simple React components)
// =============================================================
import { useFocusIdx } from "easy-email-editor";
import {
  AttributesPanelWrapper,
  TextField,
  InputWithUnitField,
} from "easy-email-extensions";

function QrCodePanel() {
  const { focusIdx } = useFocusIdx();
  return (
    <AttributesPanelWrapper>
      <div style={{ padding: "12px" }}>
        <h4 style={{ marginBottom: 8, fontSize: 13 }}>QR Code Settings</h4>
        <TextField
          label="URL"
          name={`${focusIdx}.data.value.url`}
          helpText="The URL to encode in the QR code"
        />
        <TextField
          label="Size (px)"
          name={`${focusIdx}.data.value.size`}
          helpText="Width and height of the QR code"
        />
        <TextField label="Padding" name={`${focusIdx}.attributes.padding`} />
        <TextField label="Align" name={`${focusIdx}.attributes.align`} />
      </div>
    </AttributesPanelWrapper>
  );
}

function VideoPanel() {
  const { focusIdx } = useFocusIdx();
  return (
    <AttributesPanelWrapper>
      <div style={{ padding: "12px" }}>
        <h4 style={{ marginBottom: 8, fontSize: 13 }}>Video Settings</h4>
        <TextField
          label="Video URL"
          name={`${focusIdx}.data.value.src`}
          helpText="YouTube, Vimeo, or direct video URL"
        />
        <TextField
          label="Thumbnail"
          name={`${focusIdx}.data.value.thumbnail`}
          helpText="Custom thumbnail image URL"
        />
        <TextField label="Width" name={`${focusIdx}.data.value.width`} />
        <TextField label="Padding" name={`${focusIdx}.attributes.padding`} />
      </div>
    </AttributesPanelWrapper>
  );
}

function CountdownPanel() {
  const { focusIdx } = useFocusIdx();
  return (
    <AttributesPanelWrapper>
      <div style={{ padding: "12px" }}>
        <h4 style={{ marginBottom: 8, fontSize: 13 }}>Countdown Settings</h4>
        <TextField
          label="Target Date"
          name={`${focusIdx}.data.value.targetDate`}
          helpText="YYYY-MM-DD format"
        />
        <TextField
          label="Text Color"
          name={`${focusIdx}.data.value.textColor`}
        />
        <TextField
          label="Background Color"
          name={`${focusIdx}.data.value.backgroundColor`}
        />
        <TextField label="Padding" name={`${focusIdx}.attributes.padding`} />
      </div>
    </AttributesPanelWrapper>
  );
}

// Export block type constants
export { QR_CODE_BLOCK_TYPE, VIDEO_BLOCK_TYPE, COUNTDOWN_BLOCK_TYPE };
