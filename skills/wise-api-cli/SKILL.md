---
name: wise-api-cli
description: Use when working with the current Wise Platform API through this repository's CLI, including token setup, profiles, balances, recipients, quotes, transfers, statements, supported currencies, and raw Wise API requests.
---

# Wise API CLI

Use this skill when the task is about Wise API automation and the local `wise` CLI from this repo is the preferred execution path.

## Workflow

1. Read [references/auth.md](./references/auth.md) for the current Wise auth model, token limits, and environment/base URL defaults.
2. Read [references/command-matrix.md](./references/command-matrix.md) to map the user task to the correct `wise` command.
3. Read [references/wise-api-mapping.md](./references/wise-api-mapping.md) if you need the underlying Wise endpoint versions and payload routing.
4. Use `wise api` as the fallback for endpoints or query shapes that do not have a dedicated command yet.

## Safety rules

- Never hardcode live Wise API tokens in files, tests, screenshots, commits, or docs.
- Prefer `WISE_TOKEN` or `wise auth login --token ...` over ad hoc shell history.
- Warn before funding transfers or downloading statements with personal tokens, because Wise documents regional limits and SCA/approval restrictions.
- Redact tokens and secret-bearing headers in logs or examples.

## Defaults

- Production base URL: `https://api.wise.com`
- Sandbox base URL: `https://api.wise-sandbox.com`
- Global token env vars: `WISE_TOKEN` or `WISE_API_TOKEN`
- Global profile env var: `WISE_PROFILE_ID`
- Default output: `table`

## Examples

```bash
wise auth status
wise profile list --output json
wise --profile-id 12345678 balance list
wise recipient requirements 987654321
wise quote create --profile-id 12345678 --body @quote.json
wise transfer create --body @transfer.json
wise api GET /v2/profiles
```

## Source of truth

This skill is written against the public Wise docs linked in the reference files. If Wise changes an endpoint version or payload contract, update the references and CLI mapping before relying on memory.
