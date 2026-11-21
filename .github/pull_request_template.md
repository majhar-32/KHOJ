## Summary

<!-- Provide a clear and concise description of what this PR does and why. -->


## Related Issue(s)

<!-- Link any related GitHub issues below. Use "Closes #<number>" to auto-close on merge. -->
- Closes #
- Refs #

---

## Type of Change

<!-- Check all that apply. -->

- [ ] `feat` — New feature or capability
- [ ] `fix` — Bug fix
- [ ] `docs` — Documentation only (no code changes)
- [ ] `chore` — Build, tooling, dependency update, CI config
- [ ] `refactor` — Code restructuring with no behavior change
- [ ] `test` — Adding or updating tests only
- [ ] `style` — Formatting or CSS-only changes
- [ ] `perf` — Performance improvement

---

## Scope of Change

<!-- Which part(s) of the codebase does this PR touch? -->

- [ ] Frontend (`frontend/`)
- [ ] Backend (`backend/`)
- [ ] Database / Prisma schema (`backend/prisma/`)
- [ ] API routes or controllers
- [ ] Authentication / authorization
- [ ] AI integration
- [ ] Documentation only
- [ ] Repository / GitHub configuration

---

## Changes Made

<!-- List the key changes in this PR. Be specific enough that a reviewer knows where to look. -->

-
-
-

---

## Testing

### How was this tested?

<!-- Describe the steps you took to verify the change works as expected. -->


### Test checklist

- [ ] I ran `cd backend && npm test` and all backend tests pass
- [ ] I ran `cd frontend && npm run lint` and there are no lint errors
- [ ] I manually tested the affected user flows in the browser
- [ ] I verified the change does not break existing functionality
- [ ] New backend routes/controllers have corresponding Jest + Supertest tests (if applicable)

---

## Screenshots / Screen Recordings

<!-- If this PR includes UI changes, attach before/after screenshots or a short screen recording. Remove this section if not applicable. -->


---

## Self-Review Checklist

<!-- Complete this before requesting a review. -->

- [ ] My branch is up to date with `main` (`git rebase origin/main` or `git merge origin/main`)
- [ ] My commits follow the [Conventional Commits](../CONTRIBUTING.md#commit-conventions) format
- [ ] I have not left debug `console.log` / `console.error` statements in the code
- [ ] I have not committed `.env` files, secrets, or credentials
- [ ] I have not modified `README.md` or existing application configuration unless this PR explicitly targets those files
- [ ] All TypeScript types are explicit — no unintentional `any` types added
- [ ] New environment variables are documented in `backend/.env.example`

---

## Notes for Reviewers

<!-- Anything a reviewer should know before diving in: tricky logic, deferred concerns, known limitations, etc. Leave blank if none. -->

