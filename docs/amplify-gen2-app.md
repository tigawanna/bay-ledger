# Amplify Gen 2 frontend app (Bayledger)

Scaffold a **second** SolidJS + TanStack Start app under `apps/` that matches `apps/web`, and define its backend with **Amplify Gen 2**. Anything Amplify’s `define*` helpers do not cover is added by **extending Amplify’s CDK** in `amplify/backend.ts`.

This app talks to **real AWS** via `ampx sandbox` / Amplify hosting. It does **not** replace `apps/web` or `apps/infra`. Floci stays on the existing CDK path.

Pass this file to the agent. Do not follow generic “unified vinxi + DATABASE_URL in amplify_outputs.json” writeups.

## Goal

| Piece | Choice |
| --- | --- |
| UI | Clone `apps/web`: Solid, TanStack Start / Router / Query / Form, Vite+, Tailwind, Kobalte |
| Auth | Amplify `defineAuth` → Cognito. Email username. Groups `floor` / `managers`. Same product rules as [README.md](../README.md) |
| Extra AWS | `backend.createStack()`, `backend.auth.resources.*` overrides, `defineFunction` / custom CDK constructs |
| Database | Aurora PostgreSQL (Serverless v2) via CDK on the Amplify backend. Drizzle in the app. Secrets Manager — **never** client outputs |
| Local | `vp dev` + `ampx sandbox` side by side. Sandbox writes `amplify_outputs.json` |

## Layout

Default package directory: `apps/web-amplify` (rename if the user says so). Workspace already includes `apps/*`.

```text
apps/web-amplify/
├── amplify/
│   ├── auth/
│   │   ├── resource.ts              # defineAuth
│   │   ├── pre-sign-up/             # optional; or wire packages/auth
│   │   └── post-confirmation/
│   ├── data/                        # omit unless you actually want AppSync
│   ├── backend.ts                   # defineBackend + CDK extensions
│   └── tsconfig.json
├── src/                             # same shape as apps/web
│   ├── db/                          # drizzle schema + server-only client
│   ├── routes/
│   ├── lib/auth/
│   └── ...
├── drizzle.config.ts
├── vite.config.ts                   # vp + tanstackStart + vite-plugin-solid; no Floci proxies
├── package.json                     # name: web-amplify (or @bayledger/web-amplify)
└── amplify_outputs.json             # generated; gitignore
```

Do **not** put this app at the repo root. Do **not** invent `entry-client.tsx` / `entry-server.tsx` / `app.tsx` Vinxi files. Current Start uses `src/router.ts` (`getRouter`), `src/routes/__root.tsx`, and `@tanstack/solid-start/plugin/vite`.

## Tooling (this repo)

- Package manager: **pnpm**. Runtime: **Vite+** (`vp`). Node `>=24`.
- Install: `vp install` / `pnpm install` from the monorepo root.
- Dev UI: `vp dev --port 4041` (keep 4040 for `apps/web`).
- Amplify: `@aws-amplify/backend`, `@aws-amplify/backend-cli` (`ampx`).
- Scripts in the new app:

```json
{
  "dev": "vp dev --port 4041",
  "build": "vp build",
  "sandbox": "ampx sandbox --outputs-out-dir ."
}
```

Run sandbox and `vp dev` in **two terminals**. Do not depend on `vinxi`, `npx concurrently`, or `npm` as the workspace tool.

Gitignore `amplify_outputs.json`, `.amplify/`, and the app’s `.tanstack/tmp/` (same idea as `apps/web`).

## Clone the existing frontend

Copy behavior and structure from `apps/web`, then strip Floci-only wiring:

- Keep routes, dashboard shell, forms, theme, UI kit, session cookie shape, sign-in/up/confirm, groups-as-authorization.
- Drop Vite proxies to `localhost:4566`.
- Stop reading Cognito ids from a hand-copied `.env` as the primary path. Configure the client from **generated** `amplify_outputs.json`.
- Prefer `aws-amplify` Auth against the sandbox user pool (`Amplify.configure(outputs)`). You may keep the existing JSON Cognito client **only** if it targets the real pool from outputs (region, userPoolId, userPoolClientId) over `https://cognito-idp.<region>.amazonaws.com/` — no local endpoint rewrite.

Auth product rules (unchanged):

- Email is username.
- `custom:role` is a signup hint; **Cognito groups** authorize APIs.
- `managers` precedence 10, `floor` precedence 20.
- Employee id is **not** a Cognito attribute; it lives in RDS later.

## Amplify backend

### Auth — `defineAuth`, then CDK if needed

Use Amplify’s auth resource. Groups and triggers are first-class:

```ts
// amplify/auth/resource.ts
import { defineAuth } from "@aws-amplify/backend";
import { postConfirmation } from "./post-confirmation/resource";

export const auth = defineAuth({
  loginWith: { email: true },
  groups: ["floor", "managers"],
  userAttributes: {
    givenName: { required: true, mutable: true },
    familyName: { required: true, mutable: true },
    "custom:role": { dataType: "String", mutable: true, minLen: 1, maxLen: 32 },
  },
  triggers: { postConfirmation },
  access: (allow) => [allow.resource(postConfirmation).to(["addUserToGroup"])],
});
```

Implement post-confirmation with `defineFunction` (see Amplify “add user to group”). Reuse logic from `packages/auth` where it still applies. **Do not** copy Floci pre-sign-up auto-confirm unless you still need it; real Cognito sends verification email.

Override L2/L1 constructs only when `defineAuth` cannot express it:

```ts
const backend = defineBackend({ auth });
backend.auth.resources.userPool; // L2
backend.auth.resources.cfnResources.cfnUserPool; // L1
```

SPA client: no secret, SRP (+ password if you still need it), hide user-existence errors — match `apps/infra/lib/auth-stack.ts`.

### Custom AWS — extend CDK (recommended)

Docs: [Custom resources](https://docs.amplify.aws/javascript/build-a-backend/add-aws-services/custom-resources/), [Overrides](https://docs.amplify.aws/javascript/build-a-backend/add-aws-services/overriding-resources/).

```ts
import { defineBackend } from "@aws-amplify/backend";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import { auth } from "./auth/resource";

const backend = defineBackend({ auth });

const dbStack = backend.createStack("Database");
const vpc = new ec2.Vpc(dbStack, "Vpc", { maxAzs: 2, natGateways: 1 });

const cluster = new rds.DatabaseCluster(dbStack, "Aurora", {
  engine: rds.DatabaseClusterEngine.auroraPostgres({
    version: rds.AuroraPostgresEngineVersion.VER_16_4,
  }),
  vpc,
  writer: rds.ClusterInstance.serverlessV2("writer"),
  serverlessV2MinCapacity: 0.5,
  serverlessV2MaxCapacity: 2,
  credentials: rds.Credentials.fromGeneratedSecret("bayledger"),
  defaultDatabaseName: "bayledger",
});
```

Same pattern for S3, SQS, SNS, SES, EventBridge, Lambdas as product slices land. Grant `backend.auth.resources.authenticatedUserIamRole` (and group roles) only what the client should call.

`defineData` / AppSync / Dynamo is **out of scope** unless the user asks. Do not create an empty `amplify/data/resource.ts` “for Aurora mapping” — that API is not how you attach RDS.

### Outputs vs secrets

`ampx sandbox` writes `amplify_outputs.json`. `Amplify.configure(outputs)` on the client.

`backend.addOutput` is for **non-secret** values (bucket name, region, HTTP API URL).

**Never** put a Postgres connection string, password, or Secrets Manager secret value in `addOutput` / `amplify_outputs.json`. That file is client config.

Database URL for Drizzle / Start **server** code:

- `process.env.DATABASE_URL` (local tunnel or operator-provided), or
- Amplify `secret()` / SSM SecureString resolved **only on the server**, or
- Lambda `defineFunction` environment via Secrets Manager (not rendered into client config).

## Drizzle

- Schema under `src/db/schema.ts` (`drizzle-orm/pg-core`). Link crew rows with `cognitoSub`.
- Client under `src/db/index.ts` — **server-only**. Do not import it from client components.
- `drizzle.config.ts` reads `process.env.DATABASE_URL` (or a `.env` that is gitignored). Do not import `amplify_outputs.json` for credentials.
- `pnpm exec drizzle-kit generate` / `migrate` from the app directory when the URL is available.

## TanStack Start (current APIs)

Use `@tanstack/solid-start`, not `@tanstack/start`.

```ts
import { createServerFn } from "@tanstack/solid-start";
import { getCookie, getRequest } from "@tanstack/solid-start/server";

export const getCrew = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const cookie = getCookie("bayledger.auth");
  // verify Cognito JWT (jose + JWKS), then drizzle
  return { requestMethod: request.method, cookie };
});
```

JWKS (fix the broken template that uses `://{pool}`):

`https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`

`region` and `userPoolId` come from `amplify_outputs.json` **auth** fields (or env), not from a custom DB URL.

Prefer verifying the **access** or **id** token from an httpOnly cookie or `Authorization` you set after Amplify Auth sign-in. Do not treat a decoded JWT without signature check as auth on the server.

Mutations: `createServerFn({ method: "POST" })`. Do not use GET-that-mutates.

## Sandbox connectivity (do not paper over this)

`ampx sandbox` deploys **cloud** Cognito (and Aurora). `vp dev` runs Start **on your machine**.

- Cognito from the browser: works once outputs exist.
- Private Aurora: the laptop cannot open a VPC security group by magic. Use a tunnel, a public-dev instance you accept the risk of, RDS Proxy + jump, or run SQL from a VPC Lambda. Document the chosen path in the app README.
- Do not “mock RDS with SQLite in the Amplify stack.” Unit tests may use SQLite **in Vitest only**, isolated from sandbox.

## Rejected / outdated patterns

Do not use these even if a prompt dumps them:

| Outdated | Current |
| --- | --- |
| `vinxi dev`, `entry-client.tsx` | `vp` + `@tanstack/solid-start/plugin/vite`, `getRouter()` |
| `@tanstack/start`, `createServerFn('GET', fn)` | `@tanstack/solid-start`, `.handler()` |
| `getWebRequest()` | `getRequest()` from `@tanstack/solid-start/server` |
| `amplify/data` as “Aurora mapping” | CDK `DatabaseCluster` on `createStack` |
| `addOutput({ custom: { databaseUrl } })` | Secrets Manager / env / `secret()` |
| Importing outputs in `drizzle.config.ts` for the URL | `DATABASE_URL` env |
| Malformed JWKS `cognito-idp.${region}://{pool}` | `amazonaws.com/${userPoolId}/.well-known/jwks.json` |
| npm + `concurrently` as the repo workflow | pnpm / `vp` + two terminals |
| Replacing Floci / deleting `apps/web` | New app alongside |
| Single-folder repo at `unified-amplify-app/` | `apps/<name>` in this monorepo |
| Dynamo as the default store | Aurora + Drizzle when the slice needs a DB |
| Copying Floci Vite proxies into the Amplify app | Real Cognito endpoint from outputs |

When AWS or TanStack docs disagree with this file on API names, **prefer the live docs** for method signatures, but keep this architecture (clone `apps/web`, Amplify + CDK extend, no secrets in client outputs, no Floci).

## End-to-end typesafety

TypeScript across the browser, Start server functions, Drizzle, Cognito claims, and Amplify outputs. Runtime validation at every network boundary. Do **not** rely on AppSync/`generateClient` codegen — this app is not `defineData`.

### One schema, many consumers

Put Zod (or Valibot) schemas in `src/lib/schemas/` and reuse them for:

- `createServerFn().validator(schema)` (runtime + inferred `data`)
- TanStack Form `validators` / `onSubmit`
- route `validateSearch` when the URL carries the same fields

Infer TS types with `z.infer<typeof schema>`. Do not hand-write a parallel `interface` that can drift.

### Server functions (the RPC boundary)

Keep Start’s default **`strict: true`**. Inputs and return values must be JSON-serializable (`Date`, `Map`, class instances, and Drizzle row objects with extra methods will fail the type check — map to plain objects / ISO strings).

```ts
import { createServerFn } from "@tanstack/solid-start";
import { z } from "zod";
import { crewGroupSchema } from "~/lib/schemas/auth";

const listCrewInput = z.object({
  group: crewGroupSchema.optional(),
});

export const listCrew = createServerFn({ method: "GET" })
  .validator(listCrewInput)
  .handler(async ({ data }) => {
    // data.group is CrewGroup | undefined
    return rows.map((row) => ({
      id: row.id,
      email: row.email,
      cognitoSub: row.cognitoSub,
    }));
  });
```

Callers get typed `{ data }` and a typed promise. Never `as any` the handler result. Leave `strict: false` unused unless you have a documented serializer.

Auth middleware should put a **typed** principal on context (`sub`, `email`, `groups: CrewGroup[]`) after JWT verify, not a raw `payload: Record<string, unknown>` that every handler re-parses.

### Drizzle is the DB contract

```ts
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import { crew } from "./schema";

export type Crew = InferSelectModel<typeof crew>;
export type NewCrew = InferInsertModel<typeof crew>;
```

Server functions return **DTOs**, not table types, when the row contains fields the client must not see. Keep `src/db/index.ts` server-only so the client bundle cannot import the pool.

Queries: `db.query.crew.findFirst` stays typed if you pass `{ schema }` into `drizzle()`. Do not `select *` through `sql<any>`.

Migrations stay code-first from the same schema file. After generate, the SQL is an artifact; the TypeScript schema is the type source.

### Amplify outputs without `any`

`amplify_outputs.json` is generated and gitignored, so JSON import types disappear in a clean clone. Do **not** `import outputs from "...json"` as `any`.

1. Enable `resolveJsonModule` in the app `tsconfig`.
2. Wrap access in a typed module that validates shape (Zod) once at boot:

```ts
// src/lib/amplify-outputs.ts
import { z } from "zod";

const outputsSchema = z.object({
  version: z.string(),
  auth: z.object({
    user_pool_id: z.string(),
    user_pool_client_id: z.string(),
    aws_region: z.string(),
  }),
  custom: z
    .object({
      certsBucket: z.string().optional(),
    })
    .optional(),
});

export type AmplifyOutputs = z.infer<typeof outputsSchema>;

export function readOutputs(raw: unknown): AmplifyOutputs {
  return outputsSchema.parse(raw);
}
```

Commit a **fixture** `amplify_outputs.example.json` (no secrets) so `vp check` can typecheck without a sandbox. `addOutput({ custom })` keys belong in this schema the same day you add them in CDK — if the key is not in the Zod object, the client cannot read it.

`Amplify.configure(outputs)` still takes the raw file; your app code reads **parsed** `auth.user_pool_id` etc.

### Cognito claims and groups

One union, used in JWT parse, session cookie, UI, and server middleware:

```ts
export const crewGroupSchema = z.enum(["floor", "managers"]);
export type CrewGroup = z.infer<typeof crewGroupSchema>;
```

After `jwtVerify`, parse claims with Zod (`sub`, `email`, `cognito:groups`). A verified signature is not a typed payload. Session cookies use the same `AuthSession` type as `apps/web` (`src/lib/auth/session.ts`).

### Router and forms

Keep `routeTree.gen.ts` generated. Use `createFileRoute` so `Route.useLoaderData()`, params, and search stay inferred. Validate search with the same Zod schemas. Loaders should call typed server functions, not `fetch` to untyped JSON.

TanStack Form: default values typed from `z.infer`; submit calls the server fn with `data` that already matches the validator.

### Lambdas (`defineFunction`)

Use `@types/aws-lambda` handler types (`PostConfirmationTriggerHandler`). Prefer Amplify’s generated `$amplify/env/<function-name>` for env keys instead of `process.env.FOO as string`. Do not share Drizzle types into the Lambda by copying files — import the schema package or keep handlers thin.

### Client / server split

- `createIsomorphicFn` / `createServerOnlyFn` (Start) for cookie vs `localStorage`.
- No `import type` smuggling of the db client into route components: if the value is only a type, `import type { Crew }`.
- `env.d.ts` only for real `VITE_*` keys. Database URL is **not** `VITE_`.

### Gate

`vp check` must typecheck the new app. A missing `amplify_outputs.json` must not make `tsc` fail (fixture + typed reader). CI should fail on `as any` / `as unknown as` at these boundaries if you add a lint rule; at minimum do not introduce them in auth, db, or server fns.

## Implementation order

1. Create `apps/web-amplify` by copying `apps/web` (package name, port, drop Floci proxy).
2. `ampx` backend: `defineAuth` + groups + post-confirmation.
3. `Amplify.configure` + sign-in against sandbox; prove `/sign-in` on 4041.
4. Add Aurora (or other services) with `createStack` when that slice starts.
5. Drizzle + server functions with JWT verify, shared Zod schemas, and DTO returns (`strict` mode).
6. Typed `amplify_outputs` reader + example fixture so `vp check` works without sandbox.
7. `vp check` / `vp test` for the new package.

Do not invent AppSync, RLS, or SQLite “offline Amplify” unless asked.
