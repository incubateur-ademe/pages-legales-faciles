import { type ReactElement } from "react";

import { type GitSha7, type Template, type TemplateType } from "@/lib/model/Template";
import { type IGitRepo } from "@/lib/repo/IGitRepo";
import { type MdxService } from "@/lib/services/MdxService";

import { AbstractCachedUseCase } from "./AbstractCacheUseCase";

export interface GetTemplateWithDisplayableContentIntput {
  groupId: string;
  templateId: GitSha7;
  type: TemplateType;
}

export interface GetTemplateWithDisplayableContentOutput {
  content: ReactElement;
  raw: string;
  template: Template;
}

export class GetTemplateWithDisplayableContent extends AbstractCachedUseCase<
  GetTemplateWithDisplayableContentIntput,
  GetTemplateWithDisplayableContentOutput
> {
  protected readonly cacheMasterKey = "GetTemplateWithDisplayableContent";

  constructor(
    private readonly mdxService: MdxService,
    private readonly gitRepo: IGitRepo,
  ) {
    super();
  }

  public async cachedExecute({
    groupId,
    templateId,
    type,
  }: GetTemplateWithDisplayableContentIntput): Promise<GetTemplateWithDisplayableContentOutput> {
    const template = await this.gitRepo.getTemplate(groupId, type, templateId);
    const fullRaw = await this.gitRepo.getTemplateRaw(groupId, type, templateId);
    const content = await this.mdxService.renderRawAsComponentWithFakeVariables(fullRaw);
    const raw = this.mdxService.removeMetadataFromRaw(fullRaw);

    return {
      content,
      raw,
      template,
    };
  }
}
