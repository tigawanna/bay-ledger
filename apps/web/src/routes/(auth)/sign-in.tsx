import { Link, createFileRoute, useNavigate } from "@tanstack/solid-router";
import { AuthShell } from "~/components/auth/AuthShell";
import { toastAuthError } from "~/components/auth/toast-auth-error";
import { CognitoClientError, signInCrew } from "~/lib/auth/cognito";
import { safeRedirectPath } from "~/lib/auth/session";
import { useAppForm } from "~/lib/tanstack/form";

type SignInSearch = {
  redirect?: string;
  email?: string;
};

export const Route = createFileRoute("/(auth)/sign-in")({
  validateSearch: (search: Record<string, unknown>): SignInSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const form = useAppForm(() => ({
    defaultValues: {
      email: search().email ?? "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await signInCrew(value.email.trim(), value.password);
        await navigate({ to: safeRedirectPath(search().redirect) });
      } catch (error) {
        if (error instanceof CognitoClientError && error.code === "UserNotConfirmedException") {
          await navigate({
            to: "/confirm-email",
            search: { email: value.email.trim() },
          });
          return;
        }
        toastAuthError(error instanceof Error ? error.message : "Sign-in failed.");
      }
    },
  }));

  return (
    <AuthShell
      title="Sign in"
      description="Warehouse crew and shift leads use the same door. Floor accounts come from sign-up; managers are seeded."
    >
      <form
        class="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.AppField
          name="email"
          validators={{
            onSubmit: ({ value }) =>
              !value.trim() || !value.includes("@") ? "Enter a work email" : undefined,
          }}
        >
          {(field) => (
            <field.EmailField
              label="Email"
              autocomplete="username"
              placeholder="you@warehouse.local"
            />
          )}
        </form.AppField>
        <form.AppField
          name="password"
          validators={{
            onSubmit: ({ value }) => (!value ? "Enter your password" : undefined),
          }}
        >
          {(field) => (
            <field.PasswordField
              label="Password"
              autocomplete="current-password"
              placeholder="Your password"
            />
          )}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton label="Sign in" class="w-full" />
        </form.AppForm>
      </form>
      <p class="text-muted-foreground mt-6 text-sm">
        New on the floor?{" "}
        <Link to="/sign-up" class="text-foreground font-medium underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
