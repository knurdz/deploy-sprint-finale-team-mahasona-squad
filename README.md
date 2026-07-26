# Deploy Sprint Finale Team Repository

This is your team's private Deploy Sprint finale repository.

## Work Area

- Work inside `team-site/` for the provided website.
- Use the finalist dashboard for launched task instructions, credential packs, checks, and scoring.
- Use one branch and one pull request per task where practical.
- Every scored task requires a merged PR into `main`, an approving review from another team collaborator after the final commit, and a merge by a human team member.

## Local Development

```bash
cd team-site
npm ci
npm run dev
npm run build
```

The deploy artifact is `team-site/dist/`.

## Rules Reminder

- Do not request, create, commit, or print VPS SSH private keys.
- Deployment must happen through GitHub Actions and approved deployment automation.
- Do not commit real secrets, API keys, tokens, `.env` files, or screenshots containing credentials.
- AI tools may be used for learning and drafting, but task commits, pushes, approvals, and merges must be done by real team-member GitHub accounts.
- Do not edit assistant instruction files such as `AGENTS.md` or PR-agent notes unless organizers explicitly instruct you.
