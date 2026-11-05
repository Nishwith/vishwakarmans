# Technical debt and improvements

## Confirmed from source
- Very large pages combine data, state, mutation and JSX: homeowner AdminDashboard (~1,935 lines), DesignerDashboard (~1,422), DesignerProfile (~1,074), Designers (~580); designer dashboard (~1,626). This raises change/review cost.
- Shared-looking auth, service and UI logic exists as independent copies and can drift.
- Full base schema and most RLS definitions are missing from checked-in migration; deployed authorization cannot be audited from repository alone.
- Migration creates a materialized marketplace view; whether frontend reads it is not established by matching client query evidence.

## Review targets, not confirmed vulnerabilities
Multi-call media changes may leave partial records/objects; payment entitlement and history writes remain non-atomic and concurrent retries can race despite sequential duplicate detection; supplied broad policies could create access risks if current; Worker cache/origin controls and dashboard error handling merit review. Do not classify without verifying paths and deployed settings.

## Recommended next steps
Capture live schema/policies/functions read-only; test authorization in a disposable project; make payment entitlement writes server-owned/idempotent; define media cleanup/transaction strategy; modularize dashboard features; align auth/data contracts across apps; add accessibility/performance and deployment checks.
