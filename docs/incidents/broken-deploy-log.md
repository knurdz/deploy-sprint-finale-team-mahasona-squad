# Broken Deploy Rehearsal

Seeded symptom: deployment artifact upload fails because the workflow points at `build`, but Vite writes production output to `dist`.

Expected fix: identify the log line, restore the previous release if production is affected, then change the workflow to upload/deploy `dist`.
