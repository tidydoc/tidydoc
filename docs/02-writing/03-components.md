---
description: Callouts, cards and tabs, with a plain Markdown syntax.
icon: mdi-puzzle-outline
---

# Components

## Callouts

```markdown
::: tip Optional title
Content of the callout.
:::
```

::: note
A `note` for additional information.
:::

::: tip Pro tip
A `tip` for best practices.
:::

::: warning
A `warning` for things to be careful about.
:::

::: danger
A `danger` callout for destructive or irreversible actions.
:::

## Cards

Wrap a bullet list of links in a `cards` container. The first link is the title, the rest of the line is the description. Add a number after `cards` to change the number of columns.

```markdown
::: cards
- [Installation](./installation.md) Run tidydoc with Docker.
- [Configuration](./configuration.md) Set your brand colors.
:::
```

::: cards 3
- [Installation](../01-getting-started/01-installation.md) Run tidydoc with Docker.
- [Configuration](../01-getting-started/03-configuration.md) Set your brand colors.
- [Structure](./01-structure.md) Organize your pages.
:::

## Tabs

Separate the tabs with `@tab Name` lines, each one followed by an empty line.

````markdown
::: tabs
@tab npm

```bash
npm install @acme/sdk
```

@tab pnpm

```bash
pnpm add @acme/sdk
```
:::
````

::: tabs
@tab npm

```bash
npm install @acme/sdk
```

@tab pnpm

```bash
pnpm add @acme/sdk
```

@tab yarn

```bash
yarn add @acme/sdk
```
:::

::: info Nesting
To put a container inside another one, use more colons for the outer one: `:::: tabs` … `::::`.
:::

## HTML

Raw HTML is allowed, for anything else:

<details>
<summary>Click to expand</summary>

Hidden content, with **Markdown** inside.

</details>
