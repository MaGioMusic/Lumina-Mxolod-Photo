"use client";

import * as React from "react";

import AgentSideNav from "./AgentSideNav";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface AgentShellProps {
  title: string;
  children: React.ReactNode;
}

export function AgentShell({ title, children }: AgentShellProps) {
  return (
    <SidebarProvider>
      <AgentSideNav />
      <SidebarInset>
        <SiteHeader title={title} />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
