# Download a Wise Transfer Receipt as PDF

Use this recipe when you need a local PDF receipt for an existing Wise transfer.

## 1. Find the transfer

```bash
wise --profile-id "$WISE_PROFILE_ID" transfer list --output json
```

## 2. Download the receipt

```bash
wise transfer receipt "$TRANSFER_ID" --out ./receipt.pdf
```

## 3. Verify the file

```bash
ls -lh ./receipt.pdf
```

The receipt endpoint depends on the transfer state. If Wise has not generated a receipt yet, retry after the transfer has completed.
