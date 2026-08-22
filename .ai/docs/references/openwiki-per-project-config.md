---
type: Reference
title: OpenWiki Per-Project Configuration
description: Override OpenWiki provider, model, base URL, and API key per project for PawCrew.
tags: [openwiki, lorecat, configuration, per-project]
---

# OpenWiki Per-Project Configuration

PawCrew delegates OpenWiki generation, update, and validation to the `openwiki` CLI. By default the CLI reads global credentials from `~/.openwiki/.env`. PawCrew adds a per-project override layer so each repository can use a different model, provider, base URL, or API key.

## Config file

Create or edit `.ai/openwiki.config.json` in the project root:

```json
{
  "provider": "openai-compatible",
  "modelId": "openai/gpt-5.6-luna",
  "baseUrl": "https://api.example.com/v1",
  "apiKey": "sk-..."
}
```

Run `node scripts/openwiki-bootstrap.js` to create the file if it is missing.

## Field reference

| Field | Maps to | Purpose |
|---|---|---|
| `provider` | `OPENWIKI_PROVIDER` | Provider identifier, e.g. `openai-compatible`. |
| `modelId` | `OPENWIKI_MODEL_ID` + `--modelId` CLI flag | Model used by OpenWiki for this project. |
| `baseUrl` | `OPENAI_COMPATIBLE_BASE_URL` | OpenAI-compatible API base URL. |
| `apiKey` | `OPENAI_COMPATIBLE_API_KEY` | API key for the configured provider. |

All fields are optional. Missing values fall back to `~/.openwiki/.env` and then to the OpenWiki CLI defaults.

## Security

Do not commit plain API keys. Keep `.ai/openwiki.config.json` in `.gitignore` if it contains a real key, or read the key from a secret manager and inject it before running OpenCode.

## Where it is used

- `lore-cat.ts` plugin loads this config before every `openwiki` CLI invocation.
- `scripts/openwiki-run.js` loads it for `wiki:init` / `wiki:update` npm scripts.
- `scripts/openwiki-bootstrap.js` creates the config skeleton on `postinstall`.

## Schema

The JSON schema lives at `.ai/openwiki.config.schema.json` and is referenced from the generated config file.
