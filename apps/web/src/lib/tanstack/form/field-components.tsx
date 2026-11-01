import { For, Show, createUniqueId, splitProps, type JSX } from "solid-js";
import {
  Checkbox,
  CheckboxControl,
  CheckboxDescription,
  CheckboxInput,
  CheckboxLabel,
} from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemControl,
  RadioGroupItemIndicator,
  RadioGroupItemInput,
  RadioGroupItemLabel,
} from "~/components/ui/radio-group";
import {
  HiddenSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Switch,
  SwitchControl,
  SwitchDescription,
  SwitchInput,
  SwitchLabel,
  SwitchThumb,
} from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { cx } from "~/lib/styling/cva";
import { useFieldContext } from "./form-context";

type Orientation = "vertical" | "horizontal" | "responsive";

interface BaseFieldProps {
  label?: string;
  description?: string;
  placeholder?: string;
  class?: string;
  orientation?: Orientation;
}

function toFieldErrors(errors: Array<{ message?: string } | string | undefined>) {
  return errors
    .filter(Boolean)
    .map((error) => (typeof error === "string" ? { message: error } : error)) as Array<{
    message?: string;
  }>;
}

function fieldShellClass(orientation: Orientation | undefined, className?: string) {
  return cx(
    "grid w-full gap-2",
    orientation === "horizontal" && "grid-cols-[auto_1fr] items-center",
    orientation === "responsive" && "sm:grid-cols-[auto_1fr] sm:items-center",
    className,
  );
}

function buildCommonProps(
  label: string | undefined,
  placeholder: string | undefined,
  name: string,
) {
  const fieldLabel = label || name;
  const fieldPlaceholder = placeholder || `Enter ${fieldLabel}`;
  return { fieldLabel, fieldPlaceholder } as const;
}

export function FieldErrorMessage(props: { class?: string }) {
  const field = useFieldContext<unknown>();
  const errors = () => toFieldErrors(field().state.meta.errors);

  return (
    <Show when={errors().length > 0}>
      <p class={cx("text-destructive text-sm", props.class)} data-slot="field-error">
        {errors()
          .map((error) => error.message)
          .filter(Boolean)
          .join(", ")}
      </p>
    </Show>
  );
}

export function TextField(
  props: BaseFieldProps & Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">,
) {
  const [local, inputProps] = splitProps(props, [
    "label",
    "description",
    "placeholder",
    "class",
    "orientation",
  ]);
  const field = useFieldContext<string>();
  const inputId = `${createUniqueId()}-${String(field().name)}`;
  const invalid = () => field().state.meta.errors.length > 0;
  const labels = () => buildCommonProps(local.label, local.placeholder, field().name as string);

  return (
    <div
      data-invalid={invalid() || undefined}
      class={fieldShellClass(local.orientation ?? "vertical", local.class)}
    >
      <Label for={inputId}>{labels().fieldLabel}</Label>
      <Show when={local.description}>
        <p class="text-muted-foreground text-sm">{local.description}</p>
      </Show>
      <Input
        id={inputId}
        name={field().name as string}
        placeholder={labels().fieldPlaceholder}
        aria-invalid={invalid() || undefined}
        {...inputProps}
        value={field().state.value ?? ""}
        onBlur={field().handleBlur}
        onChange={(event) => field().handleChange(event.currentTarget.value)}
      />
      <FieldErrorMessage />
    </div>
  );
}

export function PasswordField(
  props: BaseFieldProps &
    Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
      showPassword?: boolean;
    },
) {
  const [local, inputProps] = splitProps(props, [
    "label",
    "description",
    "placeholder",
    "class",
    "orientation",
    "showPassword",
  ]);
  const field = useFieldContext<string>();
  const inputId = `${createUniqueId()}-${String(field().name)}`;
  const invalid = () => field().state.meta.errors.length > 0;
  const labels = () => buildCommonProps(local.label, local.placeholder, field().name as string);

  return (
    <div
      data-invalid={invalid() || undefined}
      class={fieldShellClass(local.orientation ?? "vertical", local.class)}
    >
      <Label for={inputId}>{labels().fieldLabel}</Label>
      <Show when={local.description}>
        <p class="text-muted-foreground text-sm">{local.description}</p>
      </Show>
      <Input
        id={inputId}
        name={field().name as string}
        type={local.showPassword ? "text" : "password"}
        placeholder={labels().fieldPlaceholder}
        aria-invalid={invalid() || undefined}
        {...inputProps}
        value={field().state.value ?? ""}
        onBlur={field().handleBlur}
        onChange={(event) => field().handleChange(event.currentTarget.value)}
      />
      <FieldErrorMessage />
    </div>
  );
}

export function TextAreaField(
  props: BaseFieldProps &
    Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">,
) {
  const [local, textareaProps] = splitProps(props, [
    "label",
    "description",
    "placeholder",
    "class",
    "orientation",
  ]);
  const field = useFieldContext<string>();
  const inputId = `${createUniqueId()}-${String(field().name)}`;
  const invalid = () => field().state.meta.errors.length > 0;
  const labels = () => buildCommonProps(local.label, local.placeholder, field().name as string);

  return (
    <div
      data-invalid={invalid() || undefined}
      class={fieldShellClass(local.orientation ?? "vertical", local.class)}
    >
      <Label for={inputId}>{labels().fieldLabel}</Label>
      <Show when={local.description}>
        <p class="text-muted-foreground text-sm">{local.description}</p>
      </Show>
      <Textarea
        id={inputId}
        name={field().name as string}
        placeholder={labels().fieldPlaceholder}
        aria-invalid={invalid() || undefined}
        {...textareaProps}
        class="min-h-30"
        value={field().state.value ?? ""}
        onBlur={field().handleBlur}
        onChange={(event) => field().handleChange(event.currentTarget.value)}
      />
      <FieldErrorMessage />
    </div>
  );
}

export function EmailField(
  props: BaseFieldProps &
    Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">,
) {
  const [local, inputProps] = splitProps(props, [
    "label",
    "description",
    "placeholder",
    "class",
    "orientation",
  ]);
  const field = useFieldContext<string>();
  const inputId = `${createUniqueId()}-${String(field().name)}`;
  const invalid = () => field().state.meta.errors.length > 0;

  return (
    <div
      data-invalid={invalid() || undefined}
      class={fieldShellClass(local.orientation ?? "vertical", local.class)}
    >
      <Label for={inputId}>{local.label ?? "Email"}</Label>
      <Show when={local.description}>
        <p class="text-muted-foreground text-sm">{local.description}</p>
      </Show>
      <Input
        id={inputId}
        name={field().name as string}
        type="email"
        placeholder={local.placeholder ?? "Enter your email"}
        autocomplete="email"
        aria-invalid={invalid() || undefined}
        {...inputProps}
        value={field().state.value ?? ""}
        onBlur={field().handleBlur}
        onChange={(event) => field().handleChange(event.currentTarget.value)}
      />
      <FieldErrorMessage />
    </div>
  );
}

type SelectOption<T extends string> = { label: string; value: T };

export function SelectField<T extends string>(
  props: BaseFieldProps & {
    items: SelectOption<T>[];
  },
) {
  const field = useFieldContext<T>();
  const inputId = `${createUniqueId()}-${String(field().name)}`;
  const invalid = () => field().state.meta.errors.length > 0;
  const labels = () => buildCommonProps(props.label, props.placeholder, field().name as string);
  const selected = () => props.items.find((item) => item.value === field().state.value) ?? null;

  return (
    <div
      data-invalid={invalid() || undefined}
      class={fieldShellClass(props.orientation ?? "vertical", props.class)}
    >
      <Select<SelectOption<T>>
        options={props.items}
        optionValue="value"
        optionTextValue="label"
        value={selected()}
        onChange={(item) => {
          if (item) field().handleChange(item.value);
        }}
        onBlur={field().handleBlur}
        itemComponent={(itemProps) => (
          <SelectItem item={itemProps.item}>{itemProps.item.rawValue.label}</SelectItem>
        )}
      >
        <HiddenSelect />
        <Show when={labels().fieldLabel}>
          <Label for={inputId}>{labels().fieldLabel}</Label>
        </Show>
        <Show when={props.description}>
          <p class="text-muted-foreground text-sm">{props.description}</p>
        </Show>
        <SelectTrigger id={inputId} aria-invalid={invalid() || undefined} class="min-w-40">
          <SelectValue<SelectOption<T>>>
            {(state) => state.selectedOption()?.label ?? props.placeholder ?? "Select"}
          </SelectValue>
        </SelectTrigger>
        <SelectPortal>
          <SelectContent />
        </SelectPortal>
      </Select>
      <FieldErrorMessage />
    </div>
  );
}

export function CheckboxField(props: BaseFieldProps) {
  const field = useFieldContext<boolean>();
  const invalid = () => field().state.meta.errors.length > 0;
  const fieldLabel = () => props.label || (field().name as string);

  return (
    <div
      data-invalid={invalid() || undefined}
      class={fieldShellClass(props.orientation ?? "horizontal", props.class)}
    >
      <Checkbox
        checked={field().state.value ?? false}
        validationState={invalid() ? "invalid" : undefined}
        onChange={(checked) => field().handleChange(checked)}
        onBlur={field().handleBlur}
      >
        <CheckboxInput name={field().name as string} />
        <CheckboxControl />
        <CheckboxLabel class="font-normal">{fieldLabel()}</CheckboxLabel>
        <Show when={props.description}>
          <CheckboxDescription>{props.description}</CheckboxDescription>
        </Show>
      </Checkbox>
      <FieldErrorMessage />
    </div>
  );
}

export function SwitchField(props: BaseFieldProps) {
  const field = useFieldContext<boolean>();
  const invalid = () => field().state.meta.errors.length > 0;
  const fieldLabel = () => props.label || (field().name as string);

  return (
    <div
      data-invalid={invalid() || undefined}
      class={fieldShellClass(props.orientation ?? "horizontal", props.class)}
    >
      <Switch
        checked={field().state.value ?? false}
        validationState={invalid() ? "invalid" : undefined}
        onChange={(checked) => field().handleChange(checked)}
        onBlur={field().handleBlur}
      >
        <SwitchInput name={field().name as string} />
        <SwitchLabel>{fieldLabel()}</SwitchLabel>
        <Show when={props.description}>
          <SwitchDescription>{props.description}</SwitchDescription>
        </Show>
        <SwitchControl>
          <SwitchThumb />
        </SwitchControl>
      </Switch>
      <FieldErrorMessage />
    </div>
  );
}

export function RadioGroupField<T extends string>(
  props: BaseFieldProps & {
    items: { label: string; description?: string; value: T }[];
  },
) {
  const field = useFieldContext<T>();
  const invalid = () => field().state.meta.errors.length > 0;
  const fieldLabel = () => props.label || (field().name as string);

  return (
    <div
      data-invalid={invalid() || undefined}
      class={fieldShellClass(props.orientation ?? "vertical", props.class)}
    >
      <RadioGroup
        name={field().name as string}
        value={(field().state.value as string) ?? ""}
        validationState={invalid() ? "invalid" : undefined}
        onChange={(value) => field().handleChange(value as T)}
        class="flex flex-col gap-3"
      >
        <p class="text-sm font-medium">{fieldLabel()}</p>
        <Show when={props.description}>
          <p class="text-muted-foreground text-sm">{props.description}</p>
        </Show>
        <For each={props.items}>
          {(item) => (
            <RadioGroupItem value={item.value} class="items-start">
              <RadioGroupItemInput />
              <RadioGroupItemControl>
                <RadioGroupItemIndicator />
              </RadioGroupItemControl>
              <div class="grid gap-1">
                <RadioGroupItemLabel>{item.label}</RadioGroupItemLabel>
                <Show when={item.description}>
                  <p class="text-muted-foreground text-sm">{item.description}</p>
                </Show>
              </div>
            </RadioGroupItem>
          )}
        </For>
      </RadioGroup>
      <FieldErrorMessage />
    </div>
  );
}
