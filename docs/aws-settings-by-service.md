# AWS Settings by Service — Diary App

Suggested AWS configuration for the event-sourced diary system, aligned with [diary-app-plan.md](../diary-app-plan.md). Each section is independent so you can implement services in any order.

---

## 1. DynamoDB — Event Store

**Role:** System of record for append-only, time-ordered events per user.

### Table: `diary-events` (or `{app-name}-events`)

| Setting                    | Value                      | Notes                                                                                                         |
| -------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Table name**             | `diary-events`             | Use a prefix if multiple envs (e.g. `prod-diary-events`).                                                     |
| **Partition key**          | `pk` (String)              | Stores `USER#<cognito-user-id>`.                                                                              |
| **Sort key**               | `sk` (String)              | Stores `EVENT#<timestamp>#<uuid>` for time order and uniqueness.                                              |
| **Billing mode**           | On-demand                  | Fits variable, append-only traffic; switch to provisioned if you have predictable load and want cost control. |
| **Encryption**             | AWS owned (default) or CMK | Use a customer-managed key if you need key rotation or stricter compliance.                                   |
| **Point-in-time recovery** | Enabled                    | Protects against accidental deletes; raw events are irreplaceable.                                            |
| **TTL**                    | Not enabled                | Events are immutable and long-lived.                                                                          |

### Attribute names (logical schema)

- `pk` — Partition key: `USER#<user-id>`
- `sk` — Sort key: `EVENT#<iso-timestamp>#<uuid>`
- `raw_text` (String) — User’s natural-language entry
- `source` (String) — e.g. `cli`, `web`, `mobile`, `shortcut`
- `created_at` (String, ISO 8601) — Normalized ingestion time

Optional for future use: `gsi1pk` / `gsi1sk` if you add a GSI (e.g. for time-window or source queries).

### Global Secondary Index (optional)

Use only if you need time-range or source-based queries without scanning by user.

| Setting           | Value                                                 |
| ----------------- | ----------------------------------------------------- |
| **Index name**    | `by-created`                                          |
| **Partition key** | `pk` (same as base table)                             |
| **Sort key**      | `created_at` (String, ISO 8601)                       |
| **Projection**    | All attributes (or only those needed for aggregation) |

For “events in a time window” you can query by `pk = USER#<id>` and `sk between EVENT#<start> and EVENT#<end>` on the base table, so a GSI is only needed for different access patterns.

### Example item

```json
{
  "pk": "USER#us-east-1_abc123",
  "sk": "EVENT#2025-02-11T14:30:00.000Z#a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "raw_text": "Lunch at cafe, ~$15",
  "source": "web",
  "created_at": "2025-02-11T14:30:00.000Z"
}
```

### Single-user variant

If you are the only user, the table can stay as above or you can simplify keys:

| Approach                  | Partition key                          | Sort key                          | When to use                                       |
| ------------------------- | -------------------------------------- | --------------------------------- | ------------------------------------------------- |
| **Keep multi-user shape** | `pk` = `USER#<your-cognito-sub>`       | `sk` = `EVENT#<timestamp>#<uuid>` | You might add users later; no code change.        |
| **Single partition**      | `pk` = constant, e.g. `EVENTS` or `ME` | `sk` = `EVENT#<timestamp>#<uuid>` | One user only; simpler code (no user id in keys). |

- **Same table, same settings** — Billing, encryption, PITR, and capacity are unchanged. One partition is valid and will not be a bottleneck for personal diary volume.
- **Single-partition example item:**

```json
{
  "pk": "EVENTS",
  "sk": "EVENT#2025-02-11T14:30:00.000Z#a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "raw_text": "Lunch at cafe, ~$15",
  "source": "web",
  "created_at": "2025-02-11T14:30:00.000Z"
}
```

- **AppSync / Lambda:** Use a fixed partition value (e.g. `EVENTS`) instead of resolving `USER#<sub>`. You can still enforce Cognito so only you can call the API; the table just doesn’t encode user in the key.
- **If you later add users:** Add a new table or migrate to the `USER#<id>` key design and backfill; event payloads stay the same.

---

## 2. Amazon Cognito — Authentication

**Role:** Authenticate clients (CLI, web, mobile) that call AppSync and (if used) direct AWS access.

### User pool

| Setting               | Suggestion                                         | Notes                                  |
| --------------------- | -------------------------------------------------- | -------------------------------------- |
| **Sign-in options**   | Email or username (choose one)                     | Email is simpler for a personal diary. |
| **Password policy**   | Min 8 chars, upper/lower/number/symbol as required | Tighten if needed for sensitivity.     |
| **MFA**               | Optional (e.g. SMS or TOTP)                        | Recommended for web/mobile.            |
| **Account recovery**  | Email-based                                        | Keep simple.                           |
| **Self-registration** | Allow if multi-user; disable if single-user        | Depends on product scope.              |
| **Advanced security** | Optional (adaptive auth, compromised credentials)  | Use if you want extra protection.      |

### App client(s)

- **Web / Amplify:** One app client with no client secret; enable auth flows: `ALLOW_USER_PASSWORD_AUTH`, `ALLOW_REFRESH_TOKEN_AUTH`, and `ALLOW_USER_SRP_AUTH` if using Amplify Auth.
- **CLI / backend:** One app client; use client secret only if server-side; same auth flows as needed.
- **Mobile:** One app client; no secret; same flows; optional device tracking.

### Domain (Hosted UI)

- **Domain type:** Cognito domain (e.g. `diary-auth`) or custom domain.
- **Callback / sign-out URLs:** Add your web app origins and any CLI redirect URIs.

### Identity pool (optional)

Create an identity pool only if clients need **temporary AWS credentials** (e.g. direct S3 or DynamoDB access from a mobile app or CLI). For an AppSync-only ingestion path, the identity pool is not required.

---

## 3. AWS AppSync — Ingestion API

**Role:** GraphQL API for authenticated event ingestion; no LLM, no heavy logic.

### API

| Setting            | Value                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| **Name**           | `diary-api` (or `{app-name}-api`)                                     |
| **API type**       | GraphQL                                                               |
| **Authentication** | Amazon Cognito user pool (primary). Optionally API key for dev/tools. |

### Data source

- **Type:** Amazon DynamoDB.
- **Table:** `diary-events` (from §1).
- **Region:** Same as DynamoDB (and Lambda/S3 if possible).

### Resolver (Mutation: log event)

- **Mutation name:** e.g. `logEvent` or `createEvent`.
- **Request mapping:**
  - Resolve `username` or `sub` from `$context.identity` (Cognito).
  - Build `pk = USER#<sub>`, `sk = EVENT#<timestamp>#<uuid>`, plus `raw_text`, `source`, `created_at`.
  - Use `util.autoId()` or equivalent for UUID; use `util.time.nowISO8601()` or pass client timestamp and normalize.
- **Response mapping:** Return the generated keys and `created_at` (or full item).
- **Auth:** Require Cognito; no direct DynamoDB permissions for clients.

### Schema (minimal)

```graphql
type Event {
  pk: String!
  sk: String!
  raw_text: String!
  source: String
  created_at: String!
}

input LogEventInput {
  raw_text: String!
  source: String
  client_timestamp: String
}

type Mutation {
  logEvent(input: LogEventInput!): Event
}
```

### CORS / logging

- Enable access logging to CloudWatch if you need audit or debugging.
- Configure CORS for your web app origin if using browser clients.

---

## 4. Lambda — Metadata Extraction (Batch)

**Role:** Batch job that reads recent events, calls an LLM for classification/extraction, and writes derived metadata. Optional and disposable.

### Function

| Setting                   | Suggestion                                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Runtime**               | Python 3.12 or Node 20 (match your SDK and LLM client).                                                                     |
| **Architecture**          | x86_64 (or arm64 for cost).                                                                                                 |
| **Memory**                | 512 MB–1 GB (LLM HTTP calls and JSON parsing).                                                                              |
| **Timeout**               | 2–5 minutes (batch of events + external API).                                                                               |
| **Ephemeral storage**     | 512 MB default; increase if processing large batches.                                                                       |
| **Environment variables** | `EVENTS_TABLE`, `METADATA_TABLE` (or same table with different key pattern), `LLM_API_KEY` (or secret ARN), `LLM_ENDPOINT`. |
| **Secrets**               | Store API keys in Secrets Manager; reference in env or fetch at cold start.                                                 |

### Invocation

- **Trigger:** EventBridge schedule (e.g. every 15–60 minutes) and/or SQS queue (if you enqueue from DynamoDB Streams).
- **Input:** Either fixed “last N minutes” window or event payload with time range.

### Permissions (IAM)

- `dynamodb:Query` / `dynamodb:GetItem` on events table (by `pk`, `sk` range).
- `dynamodb:PutItem` / `dynamodb:BatchWriteItem` on metadata table (or same table with metadata key pattern).
- `secretsmanager:GetSecretValue` for LLM API key (if used).
- Optional: `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents`.

### Optional: Second DynamoDB table for metadata

If you store derived metadata in a separate table:

- **Table name:** `diary-metadata`
- **Partition key:** `pk` (e.g. `USER#<id>`)
- **Sort key:** `sk` (e.g. `META#<event-sk>` or `META#<date>#<event-id>`)
- **Attributes:** category, amounts, todo_state, project, etc.; TTL optional for rebuildability.

---

## 5. S3 — Markdown Artifact Store

**Role:** Store daily, weekly, and monthly Markdown summaries; versioned and immutable except for regeneration.

### Bucket

| Setting                 | Value                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| **Name**                | Globally unique (e.g. `diary-artifacts-<account-id>-<region>`).                                  |
| **Region**              | Same as DynamoDB/AppSync/Lambda where possible.                                                  |
| **Block public access** | All block options ON; access only via IAM, bucket policy, or CloudFront.                         |
| **Versioning**          | Enabled (supports regeneration and rollback).                                                    |
| **Encryption**          | SSE-S3 or SSE-KMS (use KMS if you need audit of key use).                                        |
| **Lifecycle**           | Optional: transition old versions to cheaper storage or expire noncurrent versions after N days. |

### Object key layout

- `daily/YYYY-MM-DD.md`
- `weekly/YYYY-WW.md` (e.g. `2025-W06`)
- `monthly/YYYY-MM.md`

Optional prefix per user if multi-tenant: `users/<user-id>/daily/...`.

### Bucket policy (principle)

- Deny public access.
- Allow only roles used by Lambda (and optionally Amplify/build) to `s3:PutObject`, `s3:GetObject`, `s3:ListBucket` on the bucket and prefix.
- If using CloudFront: allow only the CloudFront OAC and optionally restrict by `Referer` or custom header.

### CORS (if web app reads from browser)

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["https://your-app-domain.com"],
    "ExposeHeaders": []
  }
]
```

---

## 6. EventBridge — Scheduling

**Role:** Trigger time-window aggregation and LLM summarization on daily/weekly/monthly boundaries.

### Rules (examples)

| Rule name               | Schedule                                 | Target                                 | Purpose           |
| ----------------------- | ---------------------------------------- | -------------------------------------- | ----------------- |
| `diary-daily-summary`   | `cron(0 1 * * ? *)` (01:00 UTC)          | Lambda (aggregation + daily summary)   | Daily Markdown.   |
| `diary-weekly-summary`  | `cron(0 2 ? * MON *)` (02:00 UTC Monday) | Lambda (weekly aggregation + summary)  | Weekly Markdown.  |
| `diary-monthly-summary` | `cron(0 3 1 * ? *)` (03:00 UTC, 1st)     | Lambda (monthly aggregation + summary) | Monthly Markdown. |

Adjust cron to your timezone and preference. Use one Lambda that accepts “window type” (daily/weekly/monthly) or separate Lambdas per window.

### Permissions

- EventBridge needs permission to invoke the target Lambda(s).

---

## 7. IAM — Summary of Roles

- **AppSync:** Role to read/write `diary-events` (PutItem, Query by pk/sk).
- **Lambda (metadata):** Role for DynamoDB (events + optional metadata table), Secrets Manager, CloudWatch Logs.
- **Lambda (summarization):** Role for DynamoDB (read events), S3 (PutObject/GetObject on artifact bucket), Secrets Manager (LLM key), CloudWatch Logs.
- **Cognito:** No extra role unless you use an identity pool; then identity pool role for S3 read (and optionally DynamoDB read) for artifact consumption.

---

## 8. Optional: DynamoDB Streams + Lambda (event-driven metadata)

If you want metadata extraction triggered by new events instead of (or in addition to) schedule:

- **Stream:** Enable DynamoDB Streams on `diary-events` (new image or new + old).
- **Lambda:** Event source mapping from the stream; batch process new records and call LLM, then write metadata.
- **Billing:** Stream reads + Lambda invocations; can be more real-time but higher cost than batched schedule.

---

## Implementation order suggestion

1. Cognito (user pool + app client).
2. DynamoDB (`diary-events` table).
3. AppSync (API, data source, `logEvent` resolver).
4. S3 (bucket, versioning, key layout).
5. Lambda (aggregation + summarization) and EventBridge rules.
6. Lambda (metadata extraction) and optional DynamoDB metadata table + stream.

This keeps the “ingestion + store” path working first, then adds aggregation, summarization, and optional metadata.
