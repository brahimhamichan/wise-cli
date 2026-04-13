# Wise API mapping

The CLI intentionally hides Wise's mixed endpoint versions behind stable nouns. Current mapping:

| CLI area | Wise endpoint family |
| --- | --- |
| `profile` | `GET /v2/profiles`, `GET /v2/profiles/{profileId}` |
| `balance` | `GET|POST|DELETE /v4/profiles/{profileId}/balances...` |
| `currency` | `GET /v1/currencies` |
| `recipient` | `POST /v1/accounts`, `GET|DELETE /v2/accounts...`, `GET /v1/quotes/{quoteId}/account-requirements` |
| `quote preview` | `POST /v3/quotes` |
| `quote create|show|update` | `POST|GET|PATCH /v3/profiles/{profileId}/quotes...` |
| `transfer list|show|create|cancel|payments|receipt` | `GET|POST|PUT /v1/transfers...` |
| `transfer fund` | `POST /v3/profiles/{profileId}/transfers/{transferId}/payments` |
| `transfer requirements` | `POST /v1/transfer-requirements` |
| `statement get` | `GET /v1/profiles/{profileId}/balance-statements/{balanceId}/statement.{format}` |
| `api` | raw request passthrough |

Current official docs:

- https://docs.wise.com/api-reference
- https://docs.wise.com/api-reference/profile/profile
- https://docs.wise.com/api-reference/balance
- https://docs.wise.com/api-reference/recipient
- https://docs.wise.com/api-reference/quote
- https://docs.wise.com/api-reference/transfer
- https://docs.wise.com/api-reference/balance-statement
