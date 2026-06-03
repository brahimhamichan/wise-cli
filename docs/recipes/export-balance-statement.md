# Export a Wise Balance Statement as JSON

Use this recipe to export a Wise balance statement for a fixed date range.

## 1. Find the balance id

```bash
wise --profile-id "$WISE_PROFILE_ID" balance list
```

## 2. Export the statement

```bash
wise --profile-id "$WISE_PROFILE_ID" statement get "$BALANCE_ID" \
  --currency EUR \
  --start 2026-01-01T00:00:00.000Z \
  --end 2026-01-31T23:59:59.999Z \
  --format json \
  --out ./wise-statement.json
```

## 3. Inspect the output

```bash
jq '.transactions | length' ./wise-statement.json
```

Personal tokens can have regional limits for balance statement access. If Wise rejects the request, check the token permissions, account region, and SCA or approval settings.
