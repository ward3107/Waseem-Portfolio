# Safe updates and publication

All dependency updates should remain pull requests until the relevant checks pass.
Do not use `npm audit fix --force` as a routine maintenance command.

## Required GitHub settings

The workflow file alone does not enforce merging rules. Configure the production
branch (`main`) to require pull requests and the exact check
`Typecheck, Lint, Build`, with an up-to-date branch and no administrator bypass.
Confirm the intended Vercel preview check before adding it as a required check.
Keep automatic merging disabled until browser coverage is established.

## Validation and recovery

CI installs from `package-lock.json`, checks types and lint, runs existing tests,
and creates the production build on Node 22. A failed check must be investigated.
The pre-existing production dependency audit is advisory; this PR does not
resolve or hide that security backlog.

Before publishing, verify the contact form, WhatsApp destination and primary
navigation on a preview. After publishing, verify the same routes on the live
domain. Retain the previous deployment for rollback. Application rollback does
not restore database changes.
