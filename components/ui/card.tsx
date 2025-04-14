import * as React from "react";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl bg-white/5 p-4 shadow ${className}`}>{children}</div>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-sm text-white ${className}`}>{children}</div>;
}
