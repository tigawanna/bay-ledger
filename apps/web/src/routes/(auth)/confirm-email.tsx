import { Link, createFileRoute, useNavigate } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { AuthShell } from "~/components/auth/AuthShell";
import { FormAlert } from "~/components/auth/FormAlert";
import { Label } from "~/components/ui/label";
import { OTPField, OTPFieldGroup, OTPFieldInput, OTPFieldSlot } from "~/components/ui/otp-field";
import { confirmSignUp, resendConfirmationCode } from "~/lib/auth/cognito";
import { useAppForm } from "~/lib/tanstack/form";
import { Button } from "~/components/ui/button";

type ConfirmSearch = {
  email?: string;
  sentTo?: string;
};

export const Route = createFileRoute("/(auth)/confirm-email")({
  validateSearch: (search: Record<string, unknown>): ConfirmSearch => ({
    email: typeof search.email === "string" ? search.email : undefined,
    sentTo: typeof search.sentTo === "string" ? search.sentTo : undefined,
  }),
  component: ConfirmEmailPage,
});

function ConfirmEmailPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [formError, setFormError] = createSignal<string>();
  const [resentTo, setResentTo] = createSignal<string>();
  const [resending, setResending] = createSignal(false);

  const email = () => search().email?.trim() ?? "";

  const form = useAppForm(() => ({
    defaultValues: {
      code: "",
    },
    onSubmit: async ({ value }) => {
      setFormError();
      if (!email()) {
        setFormError("Missing email. Start from sign-up.");
        return;
      }
      try {
        await confirmSignUp(email(), value.code.trim());
        await navigate({ to: "/sign-in", search: { email: email() } });
      } catch (error) {
        setFormError(error instanceof Error ? error.message : "Could not confirm.");
      }
    },
  }));

  const resend = async () => {
    if (!email()) {
      setFormError("Missing email. Start from sign-up.");
      return;
    }
    setResending(true);
    setFormError();
    try {
      const destination = await resendConfirmationCode(email());
      setResentTo(destination ?? email());
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not resend the code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      title="Confirm your email"
      description={
        search().sentTo || resentTo()
          ? `Enter the code sent to ${resentTo() ?? search().sentTo}. Locally, Floci often prints it in its logs.`
          : "Enter the six-digit code from Cognito. Locally, check the Floci logs if no mail arrives."
      }
    >
      <FormAlert message={formError()} />
      <p class="text-muted-foreground mb-5 text-sm">
        Account: <span class="text-foreground font-medium">{email() || "unknown"}</span>
      </p>
      <form
        class="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.AppField
          name="code"
          validators={{
            onSubmit: ({ value }) =>
              value.trim().length < 6 ? "Enter the 6-digit code" : undefined,
          }}
        >
          {(field) => (
            <div class="grid gap-2">
              <Label>Confirmation code</Label>
              <OTPField
                maxLength={6}
                value={field().state.value}
                onValueChange={(value) => field().handleChange(value)}
              >
                <OTPFieldInput autocomplete="one-time-code" />
                <OTPFieldGroup>
                  <OTPFieldSlot index={0} />
                  <OTPFieldSlot index={1} />
                  <OTPFieldSlot index={2} />
                  <OTPFieldSlot index={3} />
                  <OTPFieldSlot index={4} />
                  <OTPFieldSlot index={5} />
                </OTPFieldGroup>
              </OTPField>
              <field.FieldErrorMessage />
            </div>
          )}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton label="Confirm email" class="w-full" />
        </form.AppForm>
      </form>
      <div class="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <Button
          type="button"
          variant="ghost"
          class="px-0"
          disabled={resending()}
          onClick={() => void resend()}
        >
          {resending() ? "Sending…" : "Resend code"}
        </Button>
        <Link to="/sign-in" class="text-muted-foreground underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
