import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html suppressHydrationWarning>
      <Head suppressHydrationWarning />
      <body suppressHydrationWarning>
        <Main />
        <NextScript />
        {/* Fallback container for portals */}
        <div id="portal-fallback" style={{ display: "none" }} />
      </body>
    </Html>
  );
}
