import type { Metadata } from "next";
import { Providers } from "@demo/components/Providers";
import "@demo/styles/common.scss";
import "@arco-design/web-react/dist/css/arco.css";

export const metadata: Metadata = {
  title: "Easy Email Editor",
  description: "Email template editor powered by easy-email",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/arco-theme.css" />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
