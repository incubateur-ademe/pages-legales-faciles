"use client";

import { type ReactNode, Suspense } from "react";

export interface PreviewProps {
  mdxRemote: ReactNode;
}

export const Preview = ({ mdxRemote }: PreviewProps) => {
  return <Suspense fallback="CA CHARGE WESH">{mdxRemote}</Suspense>;
};
