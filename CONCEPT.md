# Bayledger

Bayledger is a warehouse crew operations tool. Floor workers log in, upload the tickets that let them run equipment, and managers look at one roster instead of chasing paper around the dock.

The product language is warehouse, not healthcare. The technical shape is the same class of problem: identity with roles, document ingest, text extraction, expiry, and a manager view of people who can be assigned to work.

## Who uses it

**Floor crew** are operators. Someone is certified to run a forklift. Someone else is certified for the assembly line. Someone else is certified for the packaging machine. They sign in, upload their certification scan, and later request leave.

**Managers** are the people who staff a shift. They need every credential in one place, they need to know who is about to lose a ticket, and they need to see who is out so they can reassign work before the shift starts.

## Core product loop

1. A crew member authenticates.
2. They upload a certification document (PDF or image) to object storage.
3. A worker pipeline scans the file and proposes fields (type, name, contents, expiry). The crew reviews a form and **approves before we save** — see [docs/certificates.md](./docs/certificates.md).
4. Expiry dates on those approved certifications become first-class data.
5. Managers browse profiles, see upcoming expiries, see leave, and assign people to tasks they are actually allowed to do.

## Domain objects (rough)

- **Crew member** — identity, group (`floor` or `managers`), employee id.
- **Certification** — type (forklift, line, packaging, …), source document, extracted text, issued/expiry dates, status (`valid`, `expiring`, `expired`).
- **Leave** — requested / approved windows so managers can plan coverage.
- **Assignment** — a task or station that requires one or more certifications, plus who is on it.

## What we are practicing

This repo is a full-stack AWS practice ground. CDK is the source of truth. Lambdas live as packages consumed by stacks.

**Services we will use (add them when the slice needs them):**

| Service | Role in Bayledger |
| --- | --- |
| Cognito | Crew identity, `floor` / `managers` groups |
| Lambda | Auth trigger, extract worker, mail/notify handlers |
| S3 | Certification PDFs and images |
| SQS | Work queue when a file lands (scan / extract) |
| SNS | Fan-out: expiry, leave, assignment events |
| SES | Email to crew (renew ticket, leave decision) |
| EventBridge Scheduler | Timed jobs (soon-to-expire certs, shift-ahead coverage) |
| AppSync | Later: GraphQL API for the dashboard |

Infra starts with Cognito only. The rest of this table is not in CDK until that slice starts.

## Naming

Package scope is `@bayledger/*`. The on-disk folder may still be `health-clerk`; rename that locally when convenient. The product name in code and docs is Bayledger.
