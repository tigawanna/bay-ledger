import { queryOptions, useQuery } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { For, Match, Show, Switch } from "solid-js";
import { ErrorTemplate } from "~/components/error/ErrorTemplate";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { getCrewUser, type CrewUser } from "~/lib/auth/cognito";
import { displayName, initials, resolveAuthSession } from "~/lib/auth/session";
import { RouterPendingComponent } from "~/lib/tanstack/router/RouterPendingComponent";

const crewQueryOptions = queryOptions({
  queryKey: ["crew-user"],
  queryFn: getCrewUser,
});

export const Route = createFileRoute("/(dashboard)/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const fallback: CrewUser | undefined = resolveAuthSession() ?? undefined;
  const crewQuery = useQuery(() => ({
    ...crewQueryOptions,
    enabled: typeof window !== "undefined",
    placeholderData: fallback,
  }));

  return (
    <div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Switch>
        <Match when={crewQuery.isPending}>
          <RouterPendingComponent />
        </Match>
        <Match when={crewQuery.isError}>
          <ErrorTemplate error={crewQuery.error} onRetry={() => void crewQuery.refetch()} />
        </Match>
        <Match when={crewQuery.data ?? fallback}>
          {(crew) => {
            const user = () => crew();
            const name = () => displayName(user());
            return (
              <>
                <div class="flex items-center gap-4">
                  <span class="bg-primary/15 text-primary flex size-16 items-center justify-center rounded-2xl text-lg font-semibold tracking-wide">
                    {initials(user())}
                  </span>
                  <div class="min-w-0">
                    <h1 class="text-2xl font-semibold tracking-tight">{name()}</h1>
                    <p class="text-muted-foreground truncate text-sm">
                      {user().email ?? user().username}
                    </p>
                  </div>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Cognito account</CardTitle>
                    <CardDescription>
                      Details from your ID token and Cognito user attributes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent class="grid gap-4 text-sm">
                    <Detail label="Given name" value={user().givenName} />
                    <Detail label="Family name" value={user().familyName} />
                    <Detail label="Email" value={user().email ?? user().username} />
                    <div class="flex items-center justify-between gap-4">
                      <span class="text-muted-foreground">Email verified</span>
                      <Show
                        when={user().emailVerified !== undefined}
                        fallback={<span class="text-muted-foreground">Unknown</span>}
                      >
                        <Badge variant={user().emailVerified ? "default" : "outline"}>
                          {user().emailVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </Show>
                    </div>
                    <Detail label="Role hint" value={user().role} />
                    <div class="flex items-start justify-between gap-4">
                      <span class="text-muted-foreground">Groups</span>
                      <div class="flex flex-wrap justify-end gap-1.5">
                        <Show
                          when={user().groups.length > 0}
                          fallback={<span class="text-muted-foreground">None</span>}
                        >
                          <For each={user().groups}>
                            {(group) => <Badge variant="secondary">{group}</Badge>}
                          </For>
                        </Show>
                      </div>
                    </div>
                    <Detail label="Username" value={user().username} />
                  </CardContent>
                </Card>
              </>
            );
          }}
        </Match>
      </Switch>
    </div>
  );
}

function Detail(props: { label: string; value?: string }) {
  return (
    <div class="flex items-center justify-between gap-4">
      <span class="text-muted-foreground">{props.label}</span>
      <span class="truncate font-medium">{props.value || "—"}</span>
    </div>
  );
}
