import Button from "@codegouvfr/react-dsfr/Button";
import { type FieldValues, type FormState, useFormContext } from "react-hook-form";

import { type SimpleObject } from "@/utils/types";

import { ClientOnly } from "../utils/ClientOnly";
import { DebugButton } from "../utils/DebugButton";

interface Props {
  collapseData?: boolean;
  formState?: FormState<FieldValues>;
}

/**
 * Recursive traversal of the errors object or array to collect all the errors.
 */
interface Issue {
  message?: string;
}
function collectErrors(issues: Issue, path?: string[]): Array<[string, string]>;
function collectErrors(issues: Issue[], path?: string[]): Array<[string, string]>;
function collectErrors(issues: SimpleObject<unknown>, path?: string[]): Array<[string, string]>;
function collectErrors(issues: Issue | Issue[] | SimpleObject<unknown>, path: string[] = []): Array<[string, string]> {
  if ("message" in issues && typeof issues.message === "string") return [[path.join("."), issues.message]];

  if (Array.isArray(issues)) {
    return issues.flatMap((issue, index) => collectErrors(issue, [...path, String(index)]));
  }

  if (typeof issues === "object") {
    return Object.entries(issues as SimpleObject<Issue>).flatMap(([key, value]) =>
      collectErrors(value, [...path, key]),
    );
  }

  return [];
}

/*
 Counter intuitive behavior of RHF: 

 It doesn't derive isValid from errors (it's not like Object.keys(errors).length > 0).

 In fact :
 - isValid is computed when the useForm's mode is set to onChange. On each keystroke, the validation is made and isValid is updated.
 - errors for a field is only updated when the user has dirty the field or when trigger is called. So if the user has not dirty the field, the isValid will probably will be false with no error.
 */

export const ReactHookFormDebug = (props: Props) => {
  const { watch, formState, trigger } = useFormContext();

  const { collapseData = true } = props;

  // Can't use ...rest because nothing is returned since formState is a Proxy and must be destructured explicitly.
  const { errors, isValid, isDirty } = props.formState || formState;

  const presenterErrors = Object.fromEntries(collectErrors(errors));

  return (
    <ClientOnly>
      <fieldset>
        <legend>React Hook Form Debug</legend>
        <fieldset>
          <legend>Form Values</legend>

          <details open={!collapseData}>
            <summary>Click me to expand form state data</summary>

            <pre>{JSON.stringify(watch(), null, 2)}</pre>
          </details>
        </fieldset>
        <fieldset>
          <legend>
            <DebugButton obj={errors} alwaysOn infoText="Form Errors" /> Form Errors
          </legend>
          <Button type="button" onClick={() => void trigger()}>
            Manually trigger validation
          </Button>
          <pre>
            isValid: {JSON.stringify(isValid, null, 2)}
            <br />
            isDirty: {JSON.stringify(isDirty, null, 2)}
          </pre>
          {/* when mode is onChange, errors are only updated when the user has dirty the field or when the form is submitted. */}
          <pre>{JSON.stringify(presenterErrors, null, 2)}</pre>
          {/* isValid is only updated when the mode of useForm is set to onChange. */}
        </fieldset>
      </fieldset>
    </ClientOnly>
  );
};
