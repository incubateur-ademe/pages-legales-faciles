import { type UniqueString } from "@/utils/types";

import { type Group } from "../model/Group";
import { type GitSha7, type Template, type TemplateType } from "../model/Template";
import { type Variable } from "../model/Variable";

export const TEMPLATE_DIR = "templates";
export const VARIABLE_DIR = "variables";
export const TEMPLATE_EXT = "md";
export const CONFIG_EXT = "json";
export const GROUP_FILE = `group.${CONFIG_EXT}`;

export const VARIABLE_ID_DEFAULT = "default";

export namespace IGitRepo {
  export type StartupId = string;
  export type VariableId = UniqueString | typeof VARIABLE_ID_DEFAULT;
  export type StartupVariables = Record<VariableId, Record<TemplateType, Variable>>;
  export type AllVariables = Record<StartupId, StartupVariables>;
}

export interface IGitRepo {
  cleanLocalRepo(): Promise<string>;
  getAllTemplates(groupId?: string): Promise<Template[]>;
  getAllVariables(): Promise<IGitRepo.AllVariables>;
  getGroup(groupId: string): Promise<Group | null>;
  getGroups(): Promise<Group[]>;
  getStartupVariables(startupId: IGitRepo.StartupId): Promise<IGitRepo.StartupVariables>;
  getTemplate(groupId: string, type: TemplateType, templateVersion?: GitSha7): Promise<Template>;
  getTemplateRaw(groupId: string, type: TemplateType, templateVersion?: GitSha7): Promise<string>;
  getTemplatesForGroup(groupId: string): Promise<Template[]>;
  getVariableForPage(
    startupId: IGitRepo.StartupId,
    variableId: IGitRepo.VariableId,
    templateType: TemplateType,
  ): Promise<Variable | null>;
  saveGroup(group: Group): Promise<void>;
  saveTemplate(
    template: Template,
    content: string,
    comment?: string,
    author?: { email: string; name: string },
  ): Promise<GitSha7>;
  seed(): Promise<void>;
}
