import * as React from "react";

export function Tabs({ children, className, ...props }: any) {
  return <div className={`tabs ${className}`} {...props}>{children}</div>;
}

export function TabsList({ children, className }: any) {
  return <div className={`flex space-x-2 ${className}`}>{children}</div>;
}

export function TabsTrigger({ children, value }: { children: React.ReactNode; value: string }) {
  return (
    <button className="px-3 py-1 rounded bg-blue-500 text-white text-sm">{children}</button>
  );
}

export function TabsContent({ children, value }: { children: React.ReactNode; value: string }) {
  return <div className="mt-4">{children}</div>;
}
