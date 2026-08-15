# Authorization

## Roles

- `member`: assigned to every authenticated account in the web application.
- `admin`: Firebase custom claim required for approvals and deliberation administration.

`setUserRole` is itself admin-only. Bootstrap the first administrator using the Firebase Admin SDK or a one-time trusted script.

## Firestore policy

- Verified member profiles are publicly readable.
- A member can read their own full document and update profile fields or their vote map.
- Profile writes cannot self-approve; edited profiles must remain unverified.
- Deliberation candidate and active-candidate data require authentication to read and admin access to write.
- Authenticated members can toggle only the `marked` field on bingo cells.

A legacy administrator UID remains in rules temporarily. Remove it after custom claims are confirmed in production.

## Client versus server

The web repositories preserve compatibility with the current Firestore data and direct-write flow. Matching Cloud Functions are included for the hardened end state. Migrate clients to call those Functions before tightening rules to server-only privileged writes.
