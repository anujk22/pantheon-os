"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Shell } from "./Shell";

export function ClientShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (pathname === "/onboarding") {
    return <>{children}</>;
  }
  
  return <Shell>{children}</Shell>;
}
