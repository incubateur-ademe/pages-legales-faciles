"use client";

import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type MemberStartup,
  type StartupWithIncubator,
} from "@incubateur-ademe/next-auth-espace-membre-provider/EspaceMembreClient";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Grid, GridCol } from "@/dsfr";
import { type Group, type GroupMembership } from "@/lib/model/Group";
import { GitSha7, type Template, TemplateType, TemplateTypeName } from "@/lib/model/Template";
import { type IGitRepo } from "@/lib/repo/IGitRepo";
import { toFrenchDate } from "@/utils/data";

export interface VariablesFormProps {
  disabled?: boolean;
  extra: {
    groupsMembership: Array<Group & { membership: GroupMembership }>;
    memberStartups: MemberStartup[];
    startupsVariables: IGitRepo.AllVariables;
    variables?: IGitRepo.StartupVariables;
  };
  // 4
  group?: Group;
  // 2
  productId?: string;
  // 5
  sha?: GitSha7;
  // 1
  startup?: StartupWithIncubator;
  // 3
  type?: TemplateType;
}

const formSchema = z.object({
  startupId: z.string(),
  productId: z.string().or(z.literal("default")),
  templateType: TemplateType,
  groupId: z.string().or(z.literal("default")),
  sha: GitSha7,
});

type FormType = z.infer<typeof formSchema>;

export const VariablesForm = ({
  group,
  sha,
  startup,
  type,
  productId,
  disabled: disableForm,
  extra: { groupsMembership, memberStartups, variables, startupsVariables },
}: VariablesFormProps) => {
  const defaultValues = {
    startupId: startup?.ghid || "",
    productId: productId || "default",
    templateType: type || ("" as TemplateType),
    groupId: group?.id || "default",
    sha: sha || ("" as GitSha7),
  } as const satisfies FormType;

  const defaultGroup = groupsMembership.find(g => g.id === defaultValues.groupId);
  const defaultTemplate = defaultGroup?.templates?.find(t => t.type === defaultValues.templateType);

  const [currentVariables, setCurrentVariables] = useState<IGitRepo.StartupVariables | undefined>(variables);
  const [currentGroup, setCurrentGroup] = useState<Group | undefined>(group ?? defaultGroup);
  const [currentTemplate, setCurrentTemplate] = useState<Template | undefined>(defaultTemplate);

  const router = useRouter();

  const {
    formState: { errors, isValid },
    register,
    watch,
    resetField,
    getValues,
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const currentMemberStartups = memberStartups.filter(startup => startup.isCurrent);

  const watchTemplateType = watch("templateType");

  function updateVariables() {
    const startupId = getValues("startupId");
    if (startupId !== defaultValues.startupId) {
      const foundVariables = startupsVariables[startupId];
      if (foundVariables) {
        console.log({ foundVariables });
        setCurrentVariables(foundVariables);
      } else {
        console.warn("No variables found for startup", startupId);
        setCurrentVariables({ default: {} as IGitRepo.StartupVariables["default"] });
      }
    } else {
      setCurrentVariables(variables);
    }
  }

  function updateGroup() {
    const groupId = getValues("groupId");
    if (groupId !== defaultValues.groupId) {
      const foundGroup = groupsMembership.find(group => group.id === groupId);
      setCurrentGroup(foundGroup);
    } else {
      setCurrentGroup(group ?? defaultGroup);
    }
  }

  function updateTemplate() {
    const templateType = getValues("templateType");
    if (templateType !== defaultValues.templateType) {
      const foundTemplate = currentGroup?.templates?.find(template => template.type === templateType);
      setCurrentTemplate(foundTemplate);
    } else {
      setCurrentTemplate(defaultTemplate);
    }
  }

  function resetFieldsOnChange(fieldChanged: keyof FormType) {
    switch (fieldChanged) {
      case "startupId":
        resetField("productId");
        resetField("groupId");
        resetField("templateType");
        resetField("sha");

        updateVariables();
        updateGroup();
        updateTemplate();
        break;

      case "productId":
        resetField("groupId");
        resetField("templateType");
        resetField("sha");
        break;
      case "groupId": {
        resetField("templateType");
        resetField("sha");

        updateGroup();
        updateTemplate();
        break;
      }
      case "templateType":
        resetField("sha");

        updateTemplate();
        break;
    }
  }

  const datalistProduct = Object.keys(currentVariables ?? { default: {} });
  const datalistId = useId();

  const noTemplates = !currentGroup?.templates?.length;

  return (
    <Grid haveGutters mb="6v">
      <GridCol base={6}>
        <Select
          label="Startup"
          hint="Pour quelle startup la page sera créée"
          state={errors.startupId && "error"}
          stateRelatedMessage={errors.startupId?.message}
          disabled={disableForm}
          nativeSelectProps={{
            ...register("startupId", {
              onChange() {
                resetFieldsOnChange("startupId");
              },
            }),
          }}
        >
          <option value="" disabled>
            Sélectionner une startup
          </option>
          {currentMemberStartups.map(startup => {
            return (
              <option key={startup.incubator_id} value={startup.ghid}>
                {startup.name}
              </option>
            );
          })}
        </Select>
        <Select
          label="Groupe"
          hint="De quel groupe fait partie le template"
          state={errors.groupId || noTemplates ? "error" : "default"}
          stateRelatedMessage={
            noTemplates ? "Le groupe sélectionné n'a aucun template d'utilisable" : errors.groupId?.message
          }
          disabled={disableForm}
          nativeSelectProps={{
            ...register("groupId", {
              onChange() {
                resetFieldsOnChange("groupId");
              },
              deps: ["startupId", "productId"],
            }),
          }}
        >
          <option value="" disabled>
            Sélectionner un groupe
          </option>
          {groupsMembership
            .filter(g => g.templates.length > 0)
            .map(group => {
              return (
                <option key={group.id} value={group.id}>
                  {group.name}
                  {group.membership.isOwner ? " (propriétaire)" : ""}
                  {group.membership.isMember ? " (membre)" : ""}
                </option>
              );
            })}
        </Select>
      </GridCol>
      <GridCol base={6}>
        <datalist id={datalistId}>
          {datalistProduct.map(product => {
            return <option key={product} value={product} />;
          })}
        </datalist>
        <Input
          label="Produit"
          hintText="Pour quel produit de la startup la page sera créée"
          state={errors.productId && "error"}
          stateRelatedMessage={errors.productId?.message}
          disabled={disableForm}
          nativeInputProps={{
            ...register("productId", {
              onChange() {
                resetFieldsOnChange("productId");
              },
              deps: "startupId",
            }),
            // autoComplete: "off",
            autoCapitalize: "off",
            autoCorrect: "off",
            list: datalistId,
          }}
        />
        <Select
          label="Type de page"
          hint="Quel est le type de la page à créer"
          state={errors.templateType && "error"}
          stateRelatedMessage={errors.templateType?.message}
          disabled={noTemplates || disableForm}
          nativeSelectProps={{
            ...register("templateType", {
              onChange() {
                resetFieldsOnChange("templateType");
              },
              deps: ["groupId", "startupId", "productId"],
            }),
          }}
        >
          <option value="" disabled>
            Sélectionner un type de page
          </option>
          {Object.entries(TemplateTypeName).map(([key, value]) => {
            return (
              <option
                key={key}
                value={key}
                disabled={!currentGroup?.templates?.some(template => template.type === (key as TemplateType))}
              >
                {value}
              </option>
            );
          })}
        </Select>
      </GridCol>
      <GridCol base={6} offset={3}>
        <Select
          label="Version"
          hint={
            noTemplates
              ? "Il n'y a pas de template dans le Groupe sélectionné"
              : !watchTemplateType
                ? "Veuillez sélectionner un type de page (template) en premier"
                : "Avec quelle version du template associé"
          }
          state={errors.sha && "error"}
          stateRelatedMessage={errors.sha?.message}
          disabled={noTemplates || !watchTemplateType || disableForm}
          nativeSelectProps={{
            ...register("sha", {
              deps: ["groupId", "startupId", "productId", "templateType"],
            }),
          }}
        >
          <option value="" disabled>
            Sélectionner une version
          </option>
          {currentTemplate?.versions.map((version, index) => {
            return (
              <option key={version.sha} value={version.sha}>
                {toFrenchDate(version.date)} [{version.sha}] "{version.comment}"
                {index === 0 ? " (dernière version)" : ""}
              </option>
            );
          })}
        </Select>
      </GridCol>
      <GridCol base={6} offset={3}>
        <ButtonsGroup
          buttonsEquisized
          alignment="center"
          buttons={[
            {
              children: "Générer l'aperçu",
              type: "button",
              disabled: !isValid || disableForm,
              onClick() {
                router.replace(`/variables/new?${new URLSearchParams(getValues()).toString()}`, {
                  scroll: false,
                });
              },
            },
          ]}
        />
      </GridCol>
    </Grid>
  );
};
