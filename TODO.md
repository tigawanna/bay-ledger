# Bayledger TODO

Depth lives on the current slice. Everything else is a heading until we get there.

## Now: Cognito

- [x] CDK `Auth` stack: user pool, SPA client, `floor` / `managers` groups
- [x] `@bayledger/auth` post-confirmation Lambda that puts new users in a group
- [x] Deploy Auth against local AWS (`floci` / cdklocal) and confirm pool + client outputs
- [x] Wire pool id / client id into the web app (env, not hardcoded)
- [x] Sign up / sign in / sign out screens
- [x] Protect dashboard routes; send unauthenticated users to sign in
- [ ] Surface Cognito groups in the session (floor vs manager)
- [ ] Seed a manager and a floor user for local work
- [ ] Confirm post-confirmation group assignment end to end

## Product rename / branding

- [x] npm scope `@bayledger/*`, UI title, theme storage key
- [ ] Rename the repo / folder off `health-clerk` when ready

## Document upload

- Presigned (or authenticated) upload of certification files to S3
- Per-user object keys
- Upload UI on the crew profile

## Scan and extract

- Queue + worker when a certification lands
- OCR / Textract-style text extraction
- Persist raw text plus parsed fields (especially expiry)
- Link extracted records back to the crew member

## Certification tracker

- List a person's tickets and statuses
- Expiry windows (soon / expired)
- Manager view of the whole roster
- Notify crew to renew (SES via SNS)

## Manager roster

- Profiles in one place
- Filter by certification type, expiry, station
- Assign people to tasks they are certified for

## Leave

- Crew request leave
- Manager approve / reject
- Upcoming leave on the roster so coverage is visible

## Scheduling / coverage (later)

- Shift view that combines assignments, leave, and expiring tickets
- Advance warning: “this forklift cert lapses before Thursday’s shift”

## Web app

- Role-aware navigation (floor vs manager)
- Profile, upload, roster, leave screens
- Replace starter Messages / SSE pages

## Infra packaging

- Keep Lambdas as workspace packages consumed by CDK
- S3 + SQS when upload/extract starts
- SNS + SES when we send mail (renew, leave)
- EventBridge Scheduler when expiry / shift-ahead jobs exist
- AppSync later for the dashboard API (Cognito as the authorizer)
- Data store (Dynamo or similar) for profiles, certs, leave, assignments
- Add stacks only when the matching slice starts
