# Wise auth and safety

Current Wise docs indicate:

- Production base URL: `https://api.wise.com`
- Sandbox base URL: `https://api.wise-sandbox.com`
- Personal tokens authenticate a single Wise user and are sent as `Authorization: Bearer <token>`
- Personal tokens are created in `Your Account > Integrations and tools > API tokens > Add new token`
- Partner and enterprise integrations use OAuth 2.0 with `client_id`, `client_secret`, and `redirect_url`

Important constraints from the current docs:

- Endpoint versioning is per resource, not one global API version
- Personal tokens cannot do everything; Wise documents regional limits for EU/UK users
- SCA and Wise payment approval settings can block transfer funding or quote acceptance even when payloads are otherwise valid
- Wise documents default rate limits of `100 requests/second` and `1000 requests/minute`

Use the CLI like this:

```bash
wise auth login --token "$WISE_TOKEN"
wise auth status
wise --sandbox profile list
```

Official sources:

- https://docs.wise.com/guides/developer
- https://docs.wise.com/guides/developer/auth-and-security
- https://docs.wise.com/api-docs/api-reference/versioning
- https://docs.wise.com/api-docs/guides/error-handling/common-errors
- https://docs.wise.com/api-reference/strong-customer-authentication/one-time-token
