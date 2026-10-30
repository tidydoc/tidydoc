---
description: Standard Markdown, with syntax highlighting.
icon: mdi-language-markdown-outline
---

# Markdown

tidydoc supports [CommonMark](https://commonmark.org) plus tables, auto-links and raw HTML.

## Text

You can write **bold**, *italic*, `inline code`, [links](https://example.com) and ~~strikethrough~~ text.

> Blockquotes are useful for quotes and side notes.

## Lists

- First item
- Second item
  - Nested item
- Third item

1. Install
2. Configure
3. Deploy

## Code

Code blocks are highlighted with [Shiki](https://shiki.style). Add a title after the language:

```ts title="client.ts"
import { Acme } from '@acme/sdk'

const acme = new Acme({ apiKey: process.env.ACME_API_KEY })

await acme.emails.send({
  to: 'jane@example.com',
  subject: 'Hello',
})
```

```bash
curl -X POST https://api.acme.com/v1/emails \
  -H "Authorization: Bearer $ACME_API_KEY" \
  -d '{"to": "jane@example.com"}'
```

## Tables

| Plan | Requests / month | Price |
| --- | ---: | ---: |
| Free | 1,000 | $0 |
| Pro | 100,000 | $29 |
| Business | Unlimited | $99 |

## Images

![tidydoc logo](../_assets/logo.svg)
