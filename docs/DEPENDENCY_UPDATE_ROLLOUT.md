# Dependency update safeguard rollout

Prepared on 2026-10-15 for ward3107. There are 31 reviewable pull requests. None of these rollout PRs has been merged by this task. The README-only `test` repository has no application to validate.

The table links to live PR checks. A green build is not a production user-journey verification. Each repository's `docs/SAFE_UPDATES.md` lists its checks and remaining limitations. The activation manifest records exact branch and check names.

| Repository | Pull request | Changes and remaining work |
| --- | --- | --- |
| Waseem-Portfolio | [#181](https://github.com/ward3107/Waseem-Portfolio/pull/181) | Fixed the failing lint invocation; added Node 22, update policy and the activation utility. |
| barbershop-website | [#18](https://github.com/ward3107/barbershop-website/pull/18) | New locked Vite/TypeScript build. Legacy Pages still points at missing docs/; host settings need review. |
| metaline-design | [#5](https://github.com/ward3107/metaline-design/pull/5) | New locked TypeScript/build gate; weekly dependency PRs. |
| Eiad- | [#2](https://github.com/ward3107/Eiad-/pull/2) | New TypeScript/build gate; weekly dependency PRs. |
| adan | [#42](https://github.com/ward3107/adan/pull/42) | New production build gate; browser journey remains manual. |
| habib | [#21](https://github.com/ward3107/habib/pull/21) | Added working ESLint configuration, fixed hook ordering/browser state, and added regression tests. |
| waseem-business-template | [#5](https://github.com/ward3107/waseem-business-template/pull/5) | CI targets the actual claude/ default branch; confirm hosting branch. |
| optiJalal | [#9](https://github.com/ward3107/optiJalal/pull/9) | CI targets the actual claude/ default branch; confirm hosting branch. |
| kamanisharle | [#93](https://github.com/ward3107/kamanisharle/pull/93) | Typecheck, existing unit tests and build; ESLint dependency/setup remains a separate gap. |
| officelaw | [#13](https://github.com/ward3107/officelaw/pull/13) | New quality gate passes. Existing test/audit workflows did not run on the PR; activation remains blocked. |
| suncabins | [#94](https://github.com/ward3107/suncabins/pull/94) | Preserved pricing/runtime audit/tests; moved CI to Node 22 and added weekly updates. |
| KIDFIN | [#32](https://github.com/ward3107/KIDFIN/pull/32) | Preserved Redis tests and install mode; added bounded dependency updates. |
| seatai1 | [#101](https://github.com/ward3107/seatai1/pull/101) | Preserved workspace, four browser projects, dependency audit and PWA checks. |
| careerconnect | [#466](https://github.com/ward3107/careerconnect/pull/466) | Preserved CI/Vercel rules and existing Dependabot; Node 22 and stricter activation plan. |
| VocaBagrut | [#103](https://github.com/ward3107/VocaBagrut/pull/103) | Preserved typecheck/tests/build; Node 22 and weekly update PRs. |
| biznix | [#69](https://github.com/ward3107/biznix/pull/69) | Blocked by braces/Tailwind dependency audit. Native iOS checks pass; no forced major upgrade. |
| Sybersecurity-course | [#5](https://github.com/ward3107/Sybersecurity-course/pull/5) | Existing structural/browser checks pass. Browser dependency lockfile still needs work. |
| softec-vision | [#62](https://github.com/ward3107/softec-vision/pull/62) | Existing web/static checks pass. Linux lockfile repair and advisory audit remain open. |
| liman-hadha | [#27](https://github.com/ward3107/liman-hadha/pull/27) | Preserved Node 24.15 and blocking security/game checks; smaller update groups. |
| Souvlaki | [#214](https://github.com/ward3107/Souvlaki/pull/214) | Preserved five required checks; proposed removal of bot auto-merge. Review malformed extra ruleset. |
| seo-guide-astro | [#3](https://github.com/ward3107/seo-guide-astro/pull/3) | PRs now run the real Astro build; deploy job and write permissions limited to main. |
| ragadkindergarten | [#5](https://github.com/ward3107/ragadkindergarten/pull/5) | Local asset references and script syntax checks; no new runtime dependencies. |
| NINNYO-FLOWERS | [#13](https://github.com/ward3107/NINNYO-FLOWERS/pull/13) | Local asset references and API script syntax checks. |
| ward3107- | [#2](https://github.com/ward3107/ward3107-/pull/2) | Checks the static feedback form's resource references. |
| bathline | [#3](https://github.com/ward3107/bathline/pull/3) | Existing calculator/preference tests plus local resource checks. |
| 2d-ai-character-engine | [#3](https://github.com/ward3107/2d-ai-character-engine/pull/3) | Runs existing Godot mapping contracts; this is not a deployed website. |
| Land-of-Jesus | [#9](https://github.com/ward3107/Land-of-Jesus/pull/9) | Runs lint/tests/build in its pnpm subdirectory with a frozen lockfile. |
| Vocaband | [#1425](https://github.com/ward3107/Vocaband/pull/1425) | Lockfile-matched browser images, aggregate browser gate, same-commit deployment checks; native Cloudflare integration still needs settings. |
| Shayish-Kfar-Yassif | [#37](https://github.com/ward3107/Shayish-Kfar-Yassif/pull/37) | Web build and PDF checks pass; generated catalog becomes a draft PR. Actions PR permission/CI trigger setup is required. |
| web-compliance-prompts | [#40](https://github.com/ward3107/web-compliance-prompts/pull/40) | Existing checks and gated Pages publishing preserved; main still needs protection. |
| WordPress-WooCommerce-MOVA | [#2](https://github.com/ward3107/WordPress-WooCommerce-MOVA/pull/2) | Covers newly uploaded storefront contracts/assets and theme PHP syntax. Full WordPress staging checks remain separate. |

## Activate branch protection

The GitHub connector can write code and PRs, but does not expose administrative ruleset changes. The local GitHub CLI credential is invalid and local network access is unavailable. No branch protection settings were changed during this rollout.

With an authenticated GitHub CLI on a machine with network access, use the utility in this PR. It defaults to a read-only readiness check:

```sh
node scripts/activate-dependency-guardrails.mjs
node scripts/activate-dependency-guardrails.mjs --repo ward3107/Waseem-Portfolio
```

Review `scripts/dependency-guardrails.json`, the PR changes and their latest checks before applying:

```sh
node scripts/activate-dependency-guardrails.mjs --repo ward3107/Waseem-Portfolio --apply
node scripts/activate-dependency-guardrails.mjs --apply
```

The apply command requires repository administrator access and a GitHub plan that supports the relevant rulesets. It creates a separate rule requiring PRs, up-to-date successful checks from the GitHub Actions app, resolved review threads, and protection against force pushes/deletion, with no bypass actors. It does not require a second person's approval, so the owner can still review and merge their own PR. Existing rules, including CareerConnect's Vercel requirement, remain in place.

The utility checks every required check on the current rollout revision, rejects failed/missing/pending/skipped results, and rereads the revision before writing. A matching existing rule is verified and reused. A different rule with the same name is left untouched. Each new rule is read back for verification. Repositories with blockers are reported and skipped; successful changes to other repositories remain applied. The utility never merges PRs, publishes a site, changes secrets, or deletes existing rules.

Local automated tests cover failure cases, wrong revisions/apps, administrator permissions, a moving PR, dry-run behavior and repeated application. The settings API mutation has **not** been exercised against the real account because administrative access is unavailable.

## Outstanding blockers and activation steps

- **Biznix:** the full npm audit reports GHSA-vfj7-8cjw-p6xm through the Tailwind 3 toolchain. The advisory has no patched braces release at inspection time. npm's proposed forced fix upgrades Tailwind to v4; that needs a separately reviewed compatibility migration, including iOS 15. The blocking audit is preserved.
- **Officelaw:** the new quality job passes, but the older browser and audit jobs produce no checks on the rollout PR. Their last visible scheduled runs failed. Inspect/re-enable those workflows and obtain fresh successful `test` and `audit` results before merging.
- **Shayish:** the draft catalog-PR workflow requires Actions permission to create PRs. Default GITHUB_TOKEN PRs need a maintainer-triggered PR event or a scoped App token to run ordinary CI. Configure this before merging the workflow change; artifacts remain available if PR creation is blocked.
- **Barbershop:** legacy GitHub Pages is configured for an absent `docs/` directory. Confirm whether Pages is still needed; configure the correct built-site deployment if it is.
- **Vocaband:** the Actions deployment gate does not control Cloudflare's separate native Git integration. Configure that integration so it cannot publish around the gate. Browser test gate must be required because skipped individual jobs alone are not a successful browser run.
- **Souvlaki:** the existing classic rule already requires five checks. Inspect the additional ruleset containing one combined check string. The replacement workflow stops enabling new bot auto-merges after it is merged. No open PR had an auto-merge request queued at inspection time.
- **Hosting:** Vercel listed projects but refused project-detail/settings access for the actual team with HTTP 403. The same-scope CLI fallback also failed due to local DNS/network access. Production branch settings, full live-site verification, monitoring and automatic rollback were not activated.
- **Coverage:** repositories without existing browser suites now have build/type/static checks, with preview review still required. Softec and the cybersecurity course still need reproducible lockfile work. MOVA's PHP syntax and storefront contracts do not certify a live WordPress store, payment provider or plugin compatibility.

After protection is verified, review the previews and merge the ready changes. Confirm each host publishes only the intended protected branch. Verify the production user journey after release and keep the previous working deployment available for rollback.
