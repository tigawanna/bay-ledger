# Bayledger

Warehouse crew ledger. Operators upload equipment certifications; we extract the text and expiry dates. Managers see who can work what, who is about to lose a ticket, and who is on leave.

See [CONCEPT.md](./CONCEPT.md) for the product, [TODO.md](./TODO.md) for the work list, [docs/](./docs/) for slice strategies (starting with [certificates](./docs/certificates.md)).

```text
apps/infra          CDK app (cdklocal deploy against Floci)
apps/web            SolidJS + TanStack frontend
packages/auth       Cognito post-confirmation handler
```

## Tech stack

**In use**

| Piece | What |
| --- | --- |
| pnpm workspaces | Monorepo: `apps/*` + `packages/*`, npm scope `@bayledger/*` |
| AWS CDK | Infra as code. Lambdas are workspace packages the stacks consume |
| Floci | Local AWS (`localhost:4566`). `cdklocal` / SDK calls hit Floci, not real AWS |
| Cognito | Crew identity, `floor` / `managers` groups, SPA client |
| Lambda | Post-confirmation: put the new user in a group |
| SolidJS | UI |
| TanStack | Start, Router, Query, Form, Pacer |
| Vite+ | Dev, build, check (`vp`) |
| Tailwind | Styling |

**When the matching slice starts**

| Service | Role in Bayledger |
| --- | --- |
| S3 | Certification PDFs and images |
| SQS | Work queue when a file lands (scan / extract) |
| SNS | Fan-out: expiry, leave, assignment events |
| SES | Email to crew (renew ticket, leave decision) |
| EventBridge Scheduler | Timed jobs (soon-to-expire certs, shift-ahead coverage) |
| Textract / OCR | Extract text and expiry from uploaded tickets |
| AppSync | GraphQL API for the dashboard (Cognito authorizer) |
| DynamoDB (or similar) | Profiles, certs, leave, assignments |

## Auth

Email is the username. After confirm, a post-confirmation Lambda reads `custom:role` and adds the user to a Cognito group. **Group membership is what APIs should authorize on**; `custom:role` is only a signup hint.

| Group | Precedence | Who | What they do |
| --- | --- | --- | --- |
| `managers` | 10 (higher) | Shift leads | Roster, expiries, leave, assignments |
| `floor` | 20 | Operators | Upload certs, request leave |

Missing, unknown, or `"floor"` on signup → `floor`. `"managers"` / `"manager"` → `managers`. Lower precedence wins if a user is in both groups.

Pool also stores `custom:employeeId`.

## Frontend

```bash
pnpm install
cp apps/web/.env.example apps/web/.env   # then paste Auth stack outputs
pnpm dev
```

Opens on http://localhost:4040 (`/sign-in`, `/sign-up`). Cognito user-pool calls go through the Vite `/cognito-idp` proxy to Floci. Cognito ids live in `apps/web/.env`; prod is the same keys with the prod stack’s outputs and an empty `VITE_AWS_ENDPOINT_URL`.

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
