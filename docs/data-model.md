# Data model

## `users/{uid}`

Member profile and per-candidate vote map.

- `name`, `email`, `major`, `class`, `gradYear`
- `linkedIn`, `resumeLink`, `position`
- `verified`, `copied`
- `votes: Record<candidateId, "yes" | "no" | "abstain">`

Profile edits set `verified` to `false` so an administrator can review changed public data.

## `delibs/{candidateId}`

Candidate record. Existing data uses the candidate email as the document ID.

- `name`, `major`, `gradYear`
- `events: string[]`
- `image`: Google Drive file ID
- `bidReceived: boolean`

## `selectedDelib/current`

- `selectedDelib`: candidate document ID currently shown to members.

The repository can also read an existing legacy document if `current` has not yet been created.

## `Bingo/{cellId}`

- `id`: display ordering value
- `text`
- `marked`

## `Alumni/{uid}`

Archived member profile produced by the scheduled function or migration script.
