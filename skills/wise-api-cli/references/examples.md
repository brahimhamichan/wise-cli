# Examples

## Save a token and inspect profiles

```bash
wise auth login --token "$WISE_TOKEN"
wise profile list --output json
```

## Create a quote

```bash
wise --profile-id 12345678 quote create --body @quote.json
```

## Check recipient requirements before creating a recipient

```bash
wise recipient requirements 987654321
```

## Create and fund a transfer

```bash
wise transfer create --body @transfer.json
wise --profile-id 12345678 transfer fund 456789123 --body @funding.json
```

## Use a new Wise endpoint before the CLI grows a dedicated command

```bash
wise api GET /v2/profiles
wise api POST /v1/transfers --body @transfer.json
```
