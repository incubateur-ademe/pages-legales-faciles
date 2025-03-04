import { fr } from "@codegouvfr/react-dsfr";
import { type ReactNode } from "react";

export type HrProps = { small?: boolean } & (
  | {
      as: "hr";
      children?: never;
      or?: never;
    }
  | {
      as?: "div" | "p" | "span";
      children?: never;
      or?: never;
    }
  | {
      as?: "div" | "p" | "span";
      children?: ReactNode;
      or: true;
    }
);

export const Hr = ({ as: As = "p", children, or, small }: HrProps) => {
  if (As === "hr") {
    return <hr className={fr.cx("fr-hr", small && "fr-hr--sm")} />;
  }

  return <As className={fr.cx(or ? "fr-hr-or" : "fr-hr", small && "fr-hr--sm")}>{children}</As>;
};
