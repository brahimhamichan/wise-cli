# Create a Wise Quote From JSON

Use this recipe when you want a repeatable quote request that can be versioned in a file.

## 1. Create the body

Start from `examples/quote.json` and adjust the source, target, and amount fields for your Wise profile.

```bash
cp examples/quote.json ./quote.json
$EDITOR ./quote.json
```

## 2. Create the quote

```bash
wise --profile-id "$WISE_PROFILE_ID" quote create --body @quote.json --output json
```

## 3. Inspect the quote

Use the returned quote id:

```bash
wise quote show "$QUOTE_ID" --output json
```

Wise can change quote requirements by route and account type. If a payload fails, inspect the returned requirements and use `wise api` for fields that are not yet modeled by a dedicated command.
