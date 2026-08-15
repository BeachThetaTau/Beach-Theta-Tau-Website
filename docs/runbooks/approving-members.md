# Approving members

1. Confirm the operator has the Firebase `admin` custom claim.
2. Review the member's profile fields and photo filename.
3. Invoke the `approveMember` callable Function with the member UID.
4. Confirm `users/{uid}.verified` is `true` and the profile appears in the public directory.
5. Run `npm exec tsx scripts/check-orphaned-assets.ts` to identify missing or unused photos.
