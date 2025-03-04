"use server";

import { type GitSha7, type Template, type TemplateType } from "@/lib/model/Template";
import { gitRepo } from "@/lib/repo";
import { assertServerSession } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

interface GetTemplateForStartupInput {
  groupId: string;
  productId: string;
  sha: GitSha7;
  startupId: string;
  templateType: TemplateType;
}
export async function getTemplateForStartup({
  groupId,
  productId,
  sha,
  startupId,
  templateType,
}: GetTemplateForStartupInput): Promise<ServerActionResponse<Template>> {
  await assertServerSession({
    startupMember: startupId,
  });

  const variable = await gitRepo.getVariableForPage(startupId, productId, templateType);
  if (variable) {
    return {
      ok: false,
      error: `Une variable existe déjà pour le produit ${productId} et le type de template ${templateType} de la startup ${startupId}`,
    };
  }

  const template = await gitRepo.getTemplate(groupId, templateType, sha);
  if (!template) {
    return {
      ok: false,
      error: `Le template ${templateType} avec le sha ${sha} n'existe pas pour le groupe ${groupId}`,
    };
  }

  return {
    ok: true,
    data: template,
  };
}
