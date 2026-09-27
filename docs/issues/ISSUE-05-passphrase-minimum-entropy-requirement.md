# Issue: Passphrase Verification Allows Single-Character Passphrases

## Metadata
- **Category**: security
- **Priority**: P2
- **Affected Files**:
  - `packages/shared/src/schema.ts`
  - `apps/api/src/routes/share.ts`
- **Origin**: Open Code Review (OCR) Scan Finding #34

## Problem Description
In `packages/shared/src/schema.ts`:
```typescript
export const VerifySharePassphraseSchema = z.object({
  passphrase: z.string().min(1).max(256),
});
```

The minimum length for a shared blueprint passphrase is `1`. This allows trivial single-character passphrases (e.g. `"a"`, `"1"`), making password-protected shares trivial to brute-force despite rate limiting.

Additionally, `CreateShareSchema` validates `passphraseHash` only as:
```typescript
passphraseHash: z.string().length(64).optional(),
```
It does not validate that the string is actually hexadecimal (`/^[a-f0-9]{64}$/i`), allowing non-hex strings of length 64 to pass schema validation and cause runtime cryptographic comparison issues.

## Proposed Solution
1. Introduce a minimum passphrase length:
   - Minimum: 6 or 8 characters (or minimum entropy check).
2. Validate `passphraseHash` format with hex regex:
   ```typescript
   passphraseHash: z.string().length(64).regex(/^[a-f0-9]{64}$/i, "Must be valid SHA-256 hex").optional()
   ```

## Acceptance Criteria
- [ ] Passphrases shorter than 6 characters are rejected with a clear validation error.
- [ ] Non-hexadecimal 64-character strings are rejected by `CreateShareSchema`.
- [ ] Tests updated and added for these boundary conditions.