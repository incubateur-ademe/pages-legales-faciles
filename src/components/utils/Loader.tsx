import { fr } from "@codegouvfr/react-dsfr";
import { cx, type CxArg } from "@codegouvfr/react-dsfr/tools/cx";
import { type ReactNode } from "react";
import { PulseLoader } from "react-spinners";

export interface LoaderProps {
  className?: CxArg;
  color?: string;
  loading: boolean;
  size?: string;
  text?: ReactNode;
}

export const Loader = ({
  loading,
  text = null,
  size = "1em",
  color = fr.colors.decisions.text.active.blueFrance.default,
  className,
}: LoaderProps) => (loading ? <PulseLoader className={cx(className)} size={size} color={color} /> : text);
