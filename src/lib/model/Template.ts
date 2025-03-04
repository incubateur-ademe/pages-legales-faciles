import { z } from "zod";

import { type UniqueString } from "@/utils/types";

export const GitSha7 = z.string().regex(/^[0-9a-f]{7}$/, "Le sha Git est invalide");
export type GitSha7 = UniqueString<z.infer<typeof GitSha7>>;

export enum TemplateTypeEnum {
  CGU = "cgu",
  MentionsLegales = "mentions-legales",
  PolitiqueDeConfidentialite = "politique-de-confidentialite",
  PolitiqueDeCookies = "politique-de-cookies",
}
export const TemplateTypeName = {
  [TemplateTypeEnum.CGU]: "CGU",
  [TemplateTypeEnum.MentionsLegales]: "Mentions Légales",
  [TemplateTypeEnum.PolitiqueDeConfidentialite]: "Confidentialité",
  [TemplateTypeEnum.PolitiqueDeCookies]: "Cookies",
} as const;

export const TemplateTypeShortName = {
  [TemplateTypeEnum.CGU]: "CGU",
  [TemplateTypeEnum.MentionsLegales]: "ML",
  [TemplateTypeEnum.PolitiqueDeConfidentialite]: "PC",
  [TemplateTypeEnum.PolitiqueDeCookies]: "Cookies",
} as const;

export const TemplateType = z.nativeEnum(TemplateTypeEnum, { message: "Le type de template n'existe pas" });
export type TemplateType = z.infer<typeof TemplateType>;

export const TemplateMeta = z.object({
  author: z.string(),
  lastEditor: z.string(),
  description: z.string(),
  variables: z.record(z.string()),
});

export const TemplateVersions = z.array(
  z.object({ sha: GitSha7, date: z.date(), comment: z.string().optional().default("") }),
);

export const Template = TemplateMeta.extend({
  sha: GitSha7,
  type: TemplateType,
  groupId: z.string(),
  versions: TemplateVersions,
  path: z.string(),
  gitProviderUrl: z.string().url(),
});

export type TemplateVersions = z.infer<typeof TemplateVersions>;
export type TemplateMeta = z.infer<typeof TemplateMeta>;
export type Template = z.infer<typeof Template>;
