import { Diamond } from "~/components/loading/Diamond";

export function RouterPendingComponent() {
  return (
    <div class="relative flex min-h-[50vh] w-full flex-col items-center justify-center overflow-hidden text-foreground">
      <Diamond class="w-36 text-primary" />
    </div>
  );
}
