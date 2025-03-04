import matter, { stringify as matterStringify } from "gray-matter";
import Mustache from "mustache";
import { compileMDX } from "next-mdx-remote/rsc";
import { cache, type ReactElement } from "react";

import { notImplemented } from "@/utils/error";
import { validateTemplateMeta } from "@/utils/templateMeta";
import { type SimpleObject } from "@/utils/types";

import { type Service } from "./types";

const cachedMatter = cache(matter);
const cachedMustache = cache(Mustache.render);

export class MdxService implements Service {
  public init(): void {
    // Nothing to do
  }

  public async renderRawAsComponent(rawContent: string, data?: Record<string, unknown>): Promise<ReactElement> {
    const source = cachedMustache(rawContent, data);
    const { content } = await compileMDX({
      source,
      options: {
        parseFrontmatter: true,
      },
    });
    return content;
  }

  public getFakeVariables(variables: SimpleObject<string>): SimpleObject<string> {
    return Object.fromEntries(Object.entries(variables).map(([k]) => [k, `\\{\\{${k}\\}\\}`]));
  }

  public async renderRawAsComponentWithFakeVariables(
    rawContent: string,
    variables?: SimpleObject<string>,
  ): Promise<ReactElement> {
    let usedVars = variables;
    if (!usedVars) {
      const { data } = cachedMatter(rawContent);
      usedVars = validateTemplateMeta(data).variables;
    }

    return this.renderRawAsComponent(rawContent, this.getFakeVariables(usedVars));
  }

  public removeMetadataFromRaw(rawContent: string): string {
    const { content } = cachedMatter(rawContent);
    return content;
  }

  public addMetadataToRaw(rawContent: string, metadata: Record<string, unknown>): string {
    return matterStringify(rawContent, metadata);
  }

  public renderAsMarkdown(rawContent: string, data?: Record<string, unknown>): string {
    return cachedMustache(this.removeMetadataFromRaw(rawContent), data);
  }

  public renderAsPlainText(rawContent: string, data?: Record<string, unknown>): string {
    return this.renderAsMarkdown(rawContent, data)
      .replace(/(\*\*|__)(.*?)\1/g, "$2") // Gras
      .replace(/(\*|_)(.*?)\1/g, "$2") // Italique
      .replace(/`([^`]*)`/g, "$1") // Inline code
      .replace(/~~(.*?)~~/g, "$1") // Barré
      .replace(/#+\s?(.*)/g, "$1\n") // Titres
      .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Liens
      .replace(/!\[(.*?)\]\(.*?\)/g, "$1") // Images
      .replace(/(\n\s*\n)/g, "\n\n") // Double saut de ligne pour les paragraphes
      .replace(/^\s*[-*+]\s+/gm, "- ") // Listes
      .replace(/^\s*\d+\.\s+/gm, "") // Listes numérotées
      .trim(); // Suppression des espaces inutiles
  }

  public async renderAsHtml(rawContent: string, data?: Record<string, unknown>): Promise<string> {
    return (await import("react-dom/server")).renderToString(await this.renderRawAsComponent(rawContent, data));
  }

  public renderAsPdf(rawContent: string, data?: Record<string, unknown>): Promise<Buffer> {
    return notImplemented();
  }
}
