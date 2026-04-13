# Security Policy

## Supported versions

This project currently supports the latest published release from the `main` branch and the latest GitHub tag.

## Reporting a vulnerability

Open a private report through GitHub security advisories if available for the repository. If that is not available yet, open an issue only for non-sensitive security hardening topics.

Do not include live Wise API tokens, personal data, or production account identifiers in bug reports, screenshots, test fixtures, or logs.

## Token handling expectations

- Prefer `WISE_TOKEN` or `wise auth login --token` over hardcoded credentials.
- Rotate leaked Wise tokens instead of trying to reuse them.
- Treat personal tokens as account-level secrets with payment impact.
- Review any raw `wise api` usage before sharing shell history or CI logs.
