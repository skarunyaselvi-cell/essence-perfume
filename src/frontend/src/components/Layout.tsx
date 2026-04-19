import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return <div style={{ minHeight: "100vh" }}>{children}</div>;
}
