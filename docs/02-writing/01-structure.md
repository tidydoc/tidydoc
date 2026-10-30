---
description: How folders and files become the navigation.
icon: mdi-file-tree-outline
---

# Structure

The navigation is built from your folder tree. No config file needed.

```text
docs/
├── index.md                 → /             (home page)
├── changelog.md             → /changelog
├── 01-getting-started/      → "Getting started" section
│   ├── 01-installation.md   → /getting-started/installation
│   └── 02-configuration.md  → /getting-started/configuration
├── 02-guides/               → "Guides" section
│   ├── _meta.json           → section options
│   └── webhooks/            → collapsible group
│       └── index.md         → /guides/webhooks
└── _assets/
    └── logo.svg             → /content/_assets/logo.svg
```

- Files at the root appear at the top of the sidebar.
- Top-level folders are **sections**, shown with a label.
- Deeper folders are **collapsible groups**.

## Ordering

Prefix files and folders with a number to order them: `01-installation.md`, `02-configuration.md`. The prefix is removed from the URL and from the title. Without a prefix, items are sorted alphabetically, and `index.md` comes first.

## Titles

The title of a page is, in order of priority:

1. the `title` field of the frontmatter,
2. the first `# Heading` of the file,
3. the file name (`getting-started.md` → "Getting started").

## Frontmatter

```yaml
---
title: Webhooks
description: Receive events in real time.   # subtitle under the title
icon: mdi-webhook                           # sidebar icon
order: 3                                    # overrides the numeric prefix
hidden: true                                # reachable by URL, but not in the sidebar
---
```

## Folder options

Add a `_meta.json` file in a folder to customize it:

```json
{
  "title": "API Reference",
  "order": 4,
  "icon": "mdi-api",
  "collapsed": false
}
```

Sections and folders are collapsed in the sidebar by default. Set `"collapsed": false` to open one on load. The section holding the current page always opens.

## Links and images

Link to other pages with their relative path, the same way they work on GitHub: `[Installation](../01-getting-started/01-installation.md)`. Images and other files can be relative too: `![Diagram](./diagram.png)`.

## Raw Markdown

Every page is also available as Markdown: add `.md` to its URL, like [/writing/structure.md](/writing/structure.md). Handy for LLMs and AI agents.
