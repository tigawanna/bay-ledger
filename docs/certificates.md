# Certificates

How a ticket becomes a saved certification. Other product strategies belong under `docs/`, not the repo root.

## Guard: human approve, then persist

Textract (and any later parser) is a draft, not the record. We show the crew the extracted content and a prefilled form. They check type, name, contents, and expiry, then approve and save. Only that approved payload is canonical.

That guards against:

- Real Textract missing or inventing a date / machine type
- Floci’s Textract stub, which returns fake blocks and never reads the file
- A parser mapping the wrong LINE/WORD into a field

The scan stays in S3 as evidence. The saved fields are what the roster, expiry jobs, and assignments use.

## Flow

1. Crew uploads a PDF or image (their ticket).
2. Object lands in S3; a worker calls Textract (sync or async).
3. We keep the raw Textract blocks (or a compact text dump) plus a first-pass parse: **type**, **name**, **contents**, **expiry** (and issued date if we have it).
4. Frontend shows:
   - The extracted text / key blocks (what Textract said)
   - A form filled from the parse
5. User edits if needed, then **Approve and save**.
6. We persist the approved fields, linked to the source object and the crew member. Status (`valid` / `expiring` / `expired`) is derived from the saved expiry, not from Textract.

No manager roster, no assignment eligibility, no “renew this ticket” mail until step 6.

## Fields we ask them to confirm

| Field | Meaning |
| --- | --- |
| Type | What the ticket allows (forklift, line, packaging, …) |
| Name | Holder name on the document (should match the crew member) |
| Contents | Short body / restrictions / class on the ticket |
| Expiry | Date the ticket lapses (first-class; drives status) |

Optional later: issued date, issuer, employee id printed on the scan. Same rule: proposed by extract, saved only after approve.

## Local vs AWS

Floci Textract is API-shaped and stubbed. Locally the review screen will often show dummy PAGE/LINE/WORD text. That is fine: the form still trains the loop, and the user can type the real values before save.

Against real AWS, the same UI is the hallucination check.

Do not special-case “trust Textract in prod.” Same approve-to-save path everywhere.

## What we do not do (yet)

- Auto-save parsed fields with no UI
- Treat Textract confidence scores as approval
- Manager silent-accept of someone else’s ticket (floor confirms their own upload first)
- Replacing the stored scan; we only replace the structured record on a later re-review

## Later notes (park here)

- Re-extract: new Textract run prefills the form again; previous approved record stays until they save.
- Manager override: if floor entered a bad expiry, a manager can open the same review form.
- Floci `AI_MOCK_CONFIG`: canned blocks that look like a real forklift ticket, so local UI is less empty.
