import { ErrorTemplate } from "~/components/error/ErrorTemplate";

interface RouterErrorComponentProps {
  error: unknown;
  resetError?: () => void;
}

export function RouterErrorComponent(props: RouterErrorComponentProps) {
  return (
    <ErrorTemplate
      layout="page"
      error={props.error}
      onRetry={() => {
        if (props.resetError) {
          props.resetError();
          return;
        }
        window.location.reload();
      }}
    />
  );
}
