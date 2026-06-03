# Command matrix

Use this table to pick the correct `wise` command quickly.

| Task | Command |
| --- | --- |
| Verify auth and base URL | `wise auth status` |
| Save a token locally | `wise auth login --token ...` |
| List profiles | `wise profile list` |
| Show one profile | `wise profile show <profileId>` |
| List balances | `wise --profile-id <id> balance list` |
| Show one balance | `wise --profile-id <id> balance show <balanceId>` |
| Create or close a balance | `wise --profile-id <id> balance create|close ...` |
| List currencies | `wise currency list` |
| List or inspect recipients | `wise recipient list|show ...` |
| Create or delete a recipient | `wise recipient create|delete ...` |
| Fetch dynamic recipient requirements | `wise recipient requirements <quoteId>` |
| Preview or create a quote | `wise quote preview|create ...` |
| Show or update a quote | `wise quote show|update ...` |
| List or inspect transfers | `wise transfer list|show ...` |
| Validate transfer requirements | `wise transfer requirements --body ...` |
| Create or cancel a transfer | `wise transfer create|cancel ...` |
| Fund a transfer | `wise --profile-id <id> transfer fund <transferId> --body ...` |
| Download a transfer receipt | `wise transfer receipt <transferId> --out ...` |
| Download a statement | `wise --profile-id <id> statement get <balanceId> ...` |
| Unsupported endpoint or custom query | `wise api <method> <path> ...` |
