import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { type Member, type Startup } from "@incubateur-ademe/next-auth-espace-membre-provider/EspaceMembreClient";

import { Grid, GridCol } from "@/dsfr";
import { RecapCard } from "@/dsfr/base/RecapCard";
import { groupRuleValidations } from "@/lib/model/Group";
import { type TemplateType, TemplateTypeEnum, TemplateTypeShortName } from "@/lib/model/Template";
import { type IGitRepo } from "@/lib/repo/IGitRepo";

import { TemplateTypeTag } from "./TemplateTypeTag";

export interface StartupGridProps {
  isInAnimation?: boolean;
  member?: Member | null;
  showDefaultIfNoVar?: boolean;
  startups: Startup[];
  variables: IGitRepo.AllVariables;
}

export const StartupGrid = ({ startups, variables, member, isInAnimation, showDefaultIfNoVar }: StartupGridProps) => {
  return (
    <Grid haveGutters>
      {startups.map(startup => {
        const currentStartupVariables = variables[startup.ghid] ?? (showDefaultIfNoVar ? { default: {} } : {});
        const startupVariableIds = Object.keys(currentStartupVariables);
        const isInStartup = member ? groupRuleValidations.startup(member, startup.ghid) : false;
        const disableTag = !isInStartup && !isInAnimation;

        return (
          <GridCol key={startup.uuid} md={4}>
            <RecapCard
              title={
                <>
                  {startup.name} ({startup.ghid})
                  {isInStartup && (
                    <Badge as="span" small severity="info">
                      Membre
                    </Badge>
                  )}
                </>
              }
              content={
                <ul>
                  {startupVariableIds.map(variableId => (
                    <li key={`${startup.uuid}-${variableId}`}>
                      {variableId} :{" "}
                      <ul className={fr.cx("fr-tags-group")}>
                        {(Object.keys(TemplateTypeShortName) as TemplateType[]).map(templateType => {
                          const currentVariable = currentStartupVariables[variableId]?.[templateType];
                          return currentVariable?.url ? (
                            <TemplateTypeTag
                              key={`${startup.uuid}-${variableId}-${templateType}`}
                              type={templateType}
                              linkProps={{ href: currentVariable.url, target: "_blank" }}
                              disabled={disableTag as never}
                            />
                          ) : (
                            <TemplateTypeTag
                              isNew
                              key={`${startup.uuid}-${variableId}-${templateType}`}
                              type={templateType}
                              linkProps={{ href: `/variables/${startup.ghid}/${templateType}/new` }}
                              disabled={disableTag as never}
                            />
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              }
            />
          </GridCol>
        );
      })}
    </Grid>
  );
};

export const StartupGridExplainer = () => (
  <p>
    Les pages marquées d'une étoile, par exemple <TemplateTypeTag isNew type={TemplateTypeEnum.CGU} /> sont des pages
    qui n'ont pas encore été créées. Vous pouvez les créer en cliquant sur le Tag.
    <br />
    Les startups où vous êtes{" "}
    <Badge as="span" small severity="info" className={"align-middle"}>
      Membre
    </Badge>{" "}
    sont remontées en premier.
  </p>
);
