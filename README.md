# Bayledger

Warehouse crew ledger: operators upload equipment certifications, we extract the text and expiry dates, and managers see who can work what — and who is about to lose a ticket or go on leave.

See [CONCEPT.md](./CONCEPT.md) for the product, [TODO.md](./TODO.md) for the work list.

```text
apps/infra          CDK app (cdklocal deploy)
apps/web            Solid frontend
packages/auth       Cognito post-confirmation handler
```

## Frontend

```bash
pnpm install
cp apps/web/.env.example apps/web/.env   # then paste Auth stack outputs
pnpm dev
```

Opens on http://localhost:4040. Calls go through the Vite proxy to `http://localhost:4566`. Cognito ids live in `apps/web/.env`; prod is the same keys with the prod stack’s outputs and an empty `VITE_AWS_ENDPOINT_URL`.

## Lambdas

`floci start` first. It does not need these vars.

Then, in the **same shell** you run `cdklocal` / `aws` / `pnpm run deploy`, point the SDK at Floci instead of real AWS:

```bash
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_ENDPOINT_URL_S3=http://s3.localhost.floci.io:4566

pnpm --filter infra exec cdklocal bootstrap
pnpm --filter infra run deploy
```

Use `pnpm run deploy`, not `pnpm deploy`. Bare `pnpm deploy` is pnpm's own publish command and will not hit the infra script. The `cdklocal is deprecated` banner is only a warning; bootstrap still ran against Floci.

A project `.env` is optional. If you use one, source it only in shells that talk to local AWS — a global env with `AWS_ENDPOINT_URL` will send every `aws` command at Floci.
