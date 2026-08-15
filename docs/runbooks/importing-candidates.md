# Importing deliberation candidates

1. Export the recruitment response sheet as CSV.
2. Run a dry run:
   `npm exec tsx scripts/migrate-deliberations.ts -- candidates.csv`
3. Review the candidate count and input columns in the script.
4. Authenticate with Application Default Credentials or point to the Firestore emulator.
5. Re-run with `--apply`.
6. Verify candidate profiles in the admin deliberations dashboard.

The importer merges fields and groups repeated event rows by email.
