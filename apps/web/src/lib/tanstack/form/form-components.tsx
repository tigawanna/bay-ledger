import type { JSX } from "solid-js";
import { Button } from "~/components/ui/button";
import { useFormContext } from "./form-context";

interface SubmitButtonProps {
  label?: string;
  class?: string;
  children?: JSX.Element;
}

export function SubmitButton(props: SubmitButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type="submit" disabled={isSubmitting()} class={props.class}>
          {props.children ?? (isSubmitting() ? "Submitting..." : (props.label ?? "Submit"))}
        </Button>
      )}
    </form.Subscribe>
  );
}
