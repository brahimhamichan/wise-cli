# Launch Post

Title: I built a TypeScript CLI for the Wise Platform API

I built `wise-cli`, an unofficial TypeScript command-line tool for the Wise Platform API.

It wraps common Wise workflows behind one command surface:

```bash
wise profile list --output json
wise --profile-id "$WISE_PROFILE_ID" balance list
wise quote create --body @examples/quote.json
wise transfer receipt "$TRANSFER_ID" --out ./receipt.pdf
wise api GET /v2/profiles
```

Why I built it:

- Wise uses mixed endpoint versions across profiles, balances, recipients, quotes, transfers, and statements.
- Some workflows are easier to automate from a terminal or CI job than from custom app code.
- A raw `wise api` command keeps the CLI useful when Wise adds endpoints before dedicated commands exist.

Install from GitHub:

```bash
npm install -g github:brahimhamichan/wise-cli
```

The npm package is configured as `@brahimhamichan/wise-cli` and can be published when ready:

```bash
npm install -g @brahimhamichan/wise-cli
```

The repo also includes a Codex skill for Wise API automation:

```bash
npx skills add https://github.com/brahimhamichan/wise-cli --skill wise-api-cli
```

GitHub: https://github.com/brahimhamichan/wise-cli
NPM: https://www.npmjs.com/package/@brahimhamichan/wise-cli

It is an early, conservative release and is not affiliated with Wise. Issues and feature requests are welcome.
