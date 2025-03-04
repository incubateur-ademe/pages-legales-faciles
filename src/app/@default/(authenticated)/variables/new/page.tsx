import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Input from "@codegouvfr/react-dsfr/Input";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Suspense } from "react";
import { z } from "zod";

import { ClientAnimate } from "@/components/utils/ClientAnimate";
import { Loader } from "@/components/utils/Loader";
import { CenteredContainer, Container, FormFieldset } from "@/dsfr";
import { Hr } from "@/dsfr/base/Hr";
import { RecapCard } from "@/dsfr/base/RecapCard";
import { getGroupMembership } from "@/lib/model/Group";
import { GitSha7, type Template, TemplateType } from "@/lib/model/Template";
import { auth } from "@/lib/next-auth/auth";
import { gitRepo } from "@/lib/repo";
import { type IGitRepo } from "@/lib/repo/IGitRepo";
import { getServerService } from "@/lib/services";
import { withValidation } from "@/utils/next";

import { getTemplateForStartup } from "../actions";
import { Preview } from "../Preview";
import { VariablesForm } from "../VariablesForm";
import style from "./style.module.scss";

const searchParamsSchema = z
  .object({
    startupId: z.string().optional(),
    productId: z.string().optional(),
    templateType: TemplateType.optional(),
    groupId: z.string().optional(),
    sha: GitSha7.optional(),
  })
  .superRefine((params, ctx) => {
    if (params.sha && (!params.groupId || !params.templateType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Les paramètres `groupId` et `templateType` sont requis si `sha` est défini",
        path: ["sha"],
      });
    }

    if (params.productId && !params.startupId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le paramètre `startupId` est requis si `productId` est défini",
        path: ["productId"],
      });
    }
  });

const NewVariablesPage = withValidation({ searchParamsSchema })(async ({ searchParams, searchParamsError }) => {
  const session = (await auth())!;

  const espaceMembreService = await getServerService("espaceMembre");
  const member = await espaceMembreService.getMemberByUsername(session.user.username);
  const currentStartups = member.startups.filter(s => s.isCurrent);

  let { startupId } = await searchParams;
  const { templateType, groupId, sha, productId } = await searchParams;

  if (searchParamsError?.fieldErrors) {
    return (
      <Container mt="4w">
        <Alert
          severity="error"
          title="Erreur d'url"
          description={[...Object.entries(searchParamsError.fieldErrors)]
            .map(([field, error]) => `${field}: ${error.join(" ; ")}`)
            .map((error, i) => (
              <p key={i}>{error}</p>
            ))}
        />
      </Container>
    );
  }

  let startup = startupId ? await espaceMembreService.getStartupByGhid(startupId) : undefined;
  const group = groupId ? ((await gitRepo.getGroup(groupId)) ?? undefined) : undefined;

  if (startupId && !startup) {
    return (
      <Container mt="4w">
        <Alert severity="error" title="Erreur" description="Startup introuvable" />
      </Container>
    );
  } else if (!startupId && currentStartups.length === 1) {
    startupId = currentStartups[0].ghid;
    startup = await espaceMembreService.getStartupByGhid(startupId);
  }

  if (groupId && !group) {
    return (
      <Container mt="4w">
        <Alert severity="error" title="Erreur" description="Groupe introuvable" />
      </Container>
    );
  }

  const allVariables = await gitRepo.getAllVariables();
  const startupsVariables = member.startups.reduce((acc, startup) => {
    const startupVariables = allVariables[startup.ghid];
    if (startupVariables) {
      acc[startup.ghid] = startupVariables;
    }
    return acc;
  }, {} as IGitRepo.AllVariables);

  const variables =
    startupId && startup ? await gitRepo.getStartupVariables(startupId) : ({} as IGitRepo.StartupVariables);

  const groupsMembership = await gitRepo
    .getGroups()
    .then(groups => groups.map(group => ({ ...group, membership: getGroupMembership(member, group) })));

  // check if all searchParams are defined and valid together
  // then display the preview and inform the form that it should be prefilled and disabled

  let source = "";
  let template: Template | undefined;
  const mdxService = await getServerService("mdx");

  if (startup && productId && templateType && group && sha) {
    const result = await getTemplateForStartup({
      groupId: group.id,
      productId,
      sha,
      startupId: startup.ghid,
      templateType,
    });
    if (result.ok) {
      template = result.data;
      const raw = (await gitRepo.getTemplateRaw(group.id, templateType, sha)).replaceAll(
        /{{\s*(\w+)\s*}}/g,
        "{{& $1 }}",
      );
      const data = Object.fromEntries(
        Object.entries(template.variables).map(([k, v]) => [
          k,
          `<VarEditor varId={${JSON.stringify(k)}} description={${JSON.stringify(v)}} />`,
        ]),
      );
      source = mdxService.renderAsMarkdown(raw, data);
    }
  }

  return (
    <>
      <Container mt="4w" mb={source ? "0" : "4w"}>
        <h1>Créer une nouvelle page</h1>
        <CenteredContainer haveGutters className={cx(style.container)}>
          <h2>Configuration initiale</h2>
          <VariablesForm
            disabled={!!source}
            startup={startup}
            type={templateType}
            group={group}
            sha={sha}
            extra={{ groupsMembership, memberStartups: member.startups, variables, startupsVariables }}
          />
          <Hr or>aperçu</Hr>
        </CenteredContainer>
      </Container>
      <ClientAnimate></ClientAnimate>
      {source && template && (
        <Container mb="4w">
          <RecapCard
            className={cx(style.container, "float-left sticky top-8 left-[-8rem] w-64 mx-[-8rem]", fr.cx("fr-my-2w"))}
            title="Variables"
            content={
              <FormFieldset
                legend=""
                elements={Object.entries(template.variables).map(([k, v]) => {
                  return <Input key={k} label={k} hintText={v} />;
                })}
              />
            }
          />
          <CenteredContainer className={cx(style.container)}>
            <Preview
              mdxRemote={
                <Suspense fallback={<Loader loading />}>
                  <MDXRemote
                    source={source}
                    components={{
                      VarEditor: ({ varId, description }: { description: string; varId: string }) => (
                        <span color="red" title={description}>
                          {varId}
                        </span>
                      ),
                    }}
                  />
                </Suspense>
              }
            />
          </CenteredContainer>
        </Container>
      )}
    </>
  );
});

export default NewVariablesPage;
