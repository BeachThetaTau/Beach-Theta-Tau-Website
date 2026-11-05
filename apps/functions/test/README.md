# Functions tests

Run `npm run test:functions` from the repository root, or `npm test` to run both
web and functions unit suites. Tests use Vitest's Node environment and exercise
real callable handlers via `.run()`, with the Firebase Admin database boundary
mocked. No credentials, network access, or running emulators are required.

The unit tests cover shared input validation and authorization, vote submission
and removal, voting preconditions, and vote aggregation. Database mocks do not
verify Firestore transaction retries, security rules, or deployed Auth claims.
Privileged callable functions should also be tested against the Auth and
Firestore emulators before production deployment.
