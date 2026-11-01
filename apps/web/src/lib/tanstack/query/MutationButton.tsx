import type { UseMutationResult } from "@tanstack/solid-query";
import type { ComponentProps, JSX } from "solid-js";
import { Show, splitProps } from "solid-js";
import { DashRing } from "~/components/loading/DashRing";
import { Button } from "~/components/ui/button";

interface MutationButtonProps extends ComponentProps<typeof Button> {
  label?: JSX.Element;
  mutation: UseMutationResult<any, any, any, any>;
  loaderClass?: string;
}

export function MutationButton(props: MutationButtonProps) {
  const [local, rest] = splitProps(props, ["label", "mutation", "loaderClass", "children"]);

  return (
    <Button disabled={local.mutation.isPending} {...rest}>
      {local.children ?? local.label ?? "Submit"}
      <Show when={local.mutation.isPending}>
        <DashRing class={local.loaderClass ?? "size-4"} />
      </Show>
    </Button>
  );
}
