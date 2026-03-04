"use client";

import dynamic from "next/dynamic";

// Load the editor entirely on the client side – it uses browser-only APIs
const Editor = dynamic(() => import("@demo/views/Editor"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p style={{ fontSize: 24, color: "rgba(0,0,0,0.65)" }}>
        Please wait a moment...
      </p>
    </div>
  ),
});

export default function EditorPage() {
  return <Editor />;
}
