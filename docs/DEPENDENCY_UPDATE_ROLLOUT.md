# Dependency update automation

The repository inventory and required-check names are maintained in `scripts/dependency-guardrails.json`. The activation utility adds branch rules and does not merge changes.

The policy in every project is patch/minor auto-merge after required CI, with major and unclassified updates reserved for the owner. See `docs/SAFE_UPDATES.md`. The 2026-10-18 rollout updates the earlier preparation-only pull requests and activates repository settings after verification.
