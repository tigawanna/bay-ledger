import { Link, createFileRoute, useNavigate } from "@tanstack/solid-router";
import { AuthShell } from "~/components/auth/AuthShell";
import { toastAuthError } from "~/components/auth/toast-auth-error";
import { signUpCrew } from "~/lib/auth/cognito";
import { passwordPolicyError } from "~/lib/auth/password";
import { useAppForm } from "~/lib/tanstack/form";

export const Route = createFileRoute("/(auth)/sign-up")({
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();

  const form = useAppForm(() => ({
    defaultValues: {
      givenName: "",
      familyName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      if (value.password !== value.confirmPassword) {
        toastAuthError("Passwords must match");
        return;
      }
      try {
        const result = await signUpCrew({
          email: value.email.trim(),
          password: value.password,
          givenName: value.givenName.trim(),
          familyName: value.familyName.trim(),
        });
        if (result.userConfirmed) {
          await navigate({ to: "/sign-in", search: { email: value.email.trim() } });
          return;
        }
        await navigate({
          to: "/confirm-email",
          search: {
            email: value.email.trim(),
            sentTo: result.destination,
          },
        });
      } catch (error) {
        toastAuthError(error instanceof Error ? error.message : "Sign-up failed.");
      }
    },
  }));

  return (
    <AuthShell
      title="Join the floor"
      description="Self-serve sign-up is for operators. You land in the floor group. Managers are not created here."
    >
      <form
        class="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <div class="grid gap-5 sm:grid-cols-2">
          <form.AppField
            name="givenName"
            validators={{
              onSubmit: ({ value }) => (!value.trim() ? "Required" : undefined),
            }}
          >
            {(field) => (
              <field.TextField label="First name" autocomplete="given-name" placeholder="Sam" />
            )}
          </form.AppField>
          <form.AppField
            name="familyName"
            validators={{
              onSubmit: ({ value }) => (!value.trim() ? "Required" : undefined),
            }}
          >
            {(field) => (
              <field.TextField label="Last name" autocomplete="family-name" placeholder="Nguyen" />
            )}
          </form.AppField>
        </div>
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
              autocomplete="email"
              placeholder="you@warehouse.local"
            />
          )}
        </form.AppField>
        <form.AppField
          name="password"
          validators={{
            onSubmit: ({ value }) => passwordPolicyError(value),
          }}
        >
          {(field) => (
            <field.PasswordField
              label="Password"
              description="8+ characters, mixed case, a number, and a symbol."
              autocomplete="new-password"
              placeholder="Create a password"
            />
          )}
        </form.AppField>
        <form.AppField
          name="confirmPassword"
          validators={{
            onSubmit: ({ value }) => (!value ? "Confirm your password" : undefined),
          }}
        >
          {(field) => (
            <field.PasswordField
              label="Confirm password"
              autocomplete="new-password"
              placeholder="Repeat password"
            />
          )}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton label="Create account" class="w-full" />
        </form.AppForm>
      </form>
      <p class="text-muted-foreground mt-6 text-sm">
        Already have an account?{" "}
        <Link to="/sign-in" class="text-foreground font-medium underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
