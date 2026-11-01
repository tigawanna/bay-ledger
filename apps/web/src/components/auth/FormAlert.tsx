import { Show } from "solid-js";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export function FormAlert(props: { message: string | undefined }) {
  return (
    <Show when={props.message}>
      {(message) => (
        <Alert variant="destructive" class="mb-6">
          <AlertTitle>Could not continue</AlertTitle>
          <AlertDescription>{message()}</AlertDescription>
        </Alert>
      )}
    </Show>
  );
}
