import { firstH1, parseFrontmatter, stripLeadingH1 } from './frontmatter'
import { humanize, orderPrefix, routeFromPath } from './slug'

/** Shape of /content.json, produced by docker/generate.sh and vite/content-plugin.ts. */
export interface ContentFile {
  path: string
  raw: string
}

export interface ContentBundle {
  files: ContentFile[]
}

export interface Page {
  path: string
  route: string
  title: string
  description: string
  icon?: string
  /** `order` from frontmatter */
  order?: number
  hidden: boolean
  raw: string
  body: string
}

interface FolderMeta {
  title?: string
  order?: number
  icon?: string
  collapsed?: boolean
  hidden?: boolean
}

export interface NavPage {
  type: 'page'
  title: string
  order?: number
  page: Page
}

export interface NavFolder {
  type: 'folder'
  name: string
  path: string
  title: string
  order?: number
  icon?: string
  collapsed: boolean
  hidden: boolean
  children: NavItem[]
}

export type NavItem = NavPage | NavFolder

export interface Site {
  pages: Map<string, Page>
  /** Pages at the root of the content folder, shown above the sections. */
  rootPages: NavPage[]
  /** Top-level folders, shown as labelled sections. */
  sections: NavFolder[]
  /** Visible pages in navigation order, for prev/next links. */
  flat: Page[]
}

function basename (path: string) {
  return path.split('/').at(-1)!
}

function dirname (path: string) {
  return path.split('/').slice(0, -1).join('/')
}

function parseMeta (raw: string): FolderMeta {
  try {
    const meta = JSON.parse(raw)
    return meta && typeof meta === 'object' ? meta : {}
  } catch (error) {
    console.warn('[tidydoc] invalid _meta.json', error)
    return {}
  }
}

export function buildPage (file: ContentFile): Page {
  const { data, body } = parseFrontmatter(file.raw)
  const h1 = firstH1(body)
  const title = typeof data.title === 'string' ? data.title : (h1 ?? humanize(basename(file.path)))
  return {
    path: file.path,
    route: routeFromPath(file.path),
    title,
    description: typeof data.description === 'string' ? data.description : '',
    icon: typeof data.icon === 'string' ? data.icon : undefined,
    order: typeof data.order === 'number' ? data.order : undefined,
    hidden: data.hidden === true,
    raw: file.raw,
    body: data.title === undefined && h1 ? stripLeadingH1(body) : body,
  }
}

function compare (a: NavItem, b: NavItem) {
  const orderA = a.order ?? Number.POSITIVE_INFINITY
  const orderB = b.order ?? Number.POSITIVE_INFINITY
  if (orderA !== orderB) return orderA < orderB ? -1 : 1
  return a.title.localeCompare(b.title)
}

function sortTree (folder: NavFolder) {
  folder.children = folder.children.filter(item => {
    if (item.type === 'page') return !item.page.hidden
    sortTree(item)
    return !item.hidden && item.children.length > 0
  })
  folder.children.sort(compare)
}

function flatten (items: NavItem[], out: Page[] = []) {
  for (const item of items) {
    if (item.type === 'page') out.push(item.page)
    else flatten(item.children, out)
  }
  return out
}

export function buildSite (bundle: ContentBundle): Site {
  const root: NavFolder = { type: 'folder', name: '', path: '', title: '', collapsed: false, hidden: false, children: [] }
  const folders = new Map<string, NavFolder>([['', root]])
  const metas = new Map<string, FolderMeta>()
  const pages = new Map<string, Page>()

  const folderFor = (path: string): NavFolder => {
    const existing = folders.get(path)
    if (existing) return existing
    const name = basename(path)
    const folder: NavFolder = {
      type: 'folder',
      name,
      path,
      title: humanize(name),
      order: orderPrefix(name),
      collapsed: true,
      hidden: false,
      children: [],
    }
    folders.set(path, folder)
    folderFor(dirname(path)).children.push(folder)
    return folder
  }

  for (const file of bundle.files) {
    if (basename(file.path) === '_meta.json') {
      metas.set(dirname(file.path), parseMeta(file.raw))
      continue
    }
    if (!/\.md$/i.test(file.path)) continue

    const page = buildPage(file)
    pages.set(page.route, page)

    const name = basename(file.path)
    const isIndex = /^(\d+[-_])?index\.md$/i.test(name)
    const order = page.order ?? orderPrefix(name) ?? (isIndex ? -1 : undefined)
    folderFor(dirname(file.path)).children.push({ type: 'page', title: page.title, order, page })
  }

  for (const [path, meta] of metas) {
    const folder = folders.get(path)
    if (!folder) continue
    if (typeof meta.title === 'string') folder.title = meta.title
    if (typeof meta.order === 'number') folder.order = meta.order
    if (typeof meta.icon === 'string') folder.icon = meta.icon
    if (typeof meta.collapsed === 'boolean') folder.collapsed = meta.collapsed
    if (meta.hidden === true) folder.hidden = true
  }

  sortTree(root)

  const rootPages = root.children.filter((item): item is NavPage => item.type === 'page')
  const sections = root.children.filter((item): item is NavFolder => item.type === 'folder')

  return { pages, rootPages, sections, flat: flatten([...rootPages, ...sections]) }
}
