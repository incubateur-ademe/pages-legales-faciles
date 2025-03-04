import Badge from "@codegouvfr/react-dsfr/Badge";
import Header from "@codegouvfr/react-dsfr/Header";

import { Brand } from "@/components/Brand";
import { config } from "@/config";

import { LoginLogoutHeaderItem, UserHeaderItem } from "./AuthHeaderItems";
import { Navigation } from "./Navigation";

export const AuthHeader = () => (
  <Header
    navigation={config.maintenance ? null : <Navigation />}
    brandTop={<Brand />}
    homeLinkProps={{
      href: "/",
      title: `Accueil - ${config.brand.name}`,
    }}
    serviceTitle={
      <>
        {config.brand.name}
        &nbsp;
        <Badge as="span" noIcon severity="warning">
          Alpha
        </Badge>
        {config.maintenance && (
          <Badge as="span" noIcon severity="warning">
            Maintenance
          </Badge>
        )}
      </>
    }
    serviceTagline={config.brand.tagline}
    operatorLogo={config.brand.operator.enable ? config.brand.operator.logo : undefined}
    classes={{
      operator: "shimmer",
    }}
    quickAccessItems={
      config.maintenance
        ? []
        : [<UserHeaderItem key="hqai-user" />, <LoginLogoutHeaderItem key="hqai-loginlogout" />].filter(Boolean)
    }
  />
);
