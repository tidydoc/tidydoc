import { execFileSync } from 'node:child_process'
import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'
import { ENV_KEYS } from '../src/config'
import { routeFromPath } from '../src/content/slug'

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
}

function walk (dir: string, root = dir, out: string[] = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) walk(path, root, out)
    else if (/\.md$/i.test(entry.name) || entry.name === '_meta.json') out.push(relative(root, path).split(sep).join('/'))
  }
  return out.sort()
}

function bundle (dir: string) {
  const files = existsSync(dir) ? walk(dir) : []
  return { files: files.map(path => ({ path, raw: readFileSync(join(dir, path), 'utf8') })) }
}

/** Runs docker/seo.jq like generate.sh does: generated path → content. Needs `jq`, skipped without it. */
function seoFiles (dir: string, script: string, template: string, server: ViteDevServer) {
  try {
    const siteUrl = process.env.SITE_URL || server.resolvedUrls?.local[0] || ''
    const output = execFileSync('jq', ['-r', '--arg', 'template', template, '-f', script], {
      input: JSON.stringify(bundle(dir)),
      env: { ...process.env, SITE_URL: siteUrl },
      encoding: 'utf8',
    })
    return new Map(output.split('\n').filter(Boolean).map(line => {
      const [path, data] = line.split('\t')
      return [path!, Buffer.from(data!, 'base64').toString('utf8')]
    }))
  } catch (error) {
    server.config.logger.warn(`[tidydoc] SEO tags skipped: ${error instanceof Error ? error.message : error}`)
    return new Map<string, string>()
  }
}

/**
 * Dev-only equivalent of docker/entrypoint.sh + generate.sh + nginx.conf:
 * serves /content.json, /config.js, raw `/<route>.md`, `/content/*` assets, the SEO files
 * (sitemap.xml, robots.txt, llms.txt) and the per-page head tags from a local folder.
 */
export function contentPlugin (options: { dir: string }): Plugin {
  let dir = ''
  let script = ''
  let devServer: ViteDevServer

  return {
    name: 'tidydoc-content',
    apply: 'serve',
    configResolved (config) {
      dir = resolve(config.root, options.dir)
      script = resolve(config.root, '../docker/seo.jq')
    },
    transformIndexHtml (html, ctx) {
      const route = decodeURIComponent(ctx.originalUrl?.split('?')[0] ?? '/').replace(/\/+$/, '') || '/'
      const files = seoFiles(dir, script, html, devServer)
      return files.get(route === '/' ? '_pages/index.html' : `_pages${route}.html`) ?? files.get('index.html') ?? html
    },
    configureServer (server) {
      devServer = server
      server.watcher.add(dir)
      server.watcher.on('all', (_event, file) => {
        if (file.startsWith(dir) && /(\.md|_meta\.json)$/i.test(file)) server.ws.send({ type: 'full-reload' })
      })

      server.middlewares.use((req, res, next) => {
        const url = decodeURIComponent((req.url ?? '').split('?')[0]!)

        if (url === '/content.json') {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(bundle(dir)))
          return
        }

        if (['/sitemap.xml', '/robots.txt', '/llms.txt'].includes(url)) {
          const file = seoFiles(dir, script, '', server).get(url.slice(1))
          if (file !== undefined) {
            res.setHeader('Content-Type', url.endsWith('.xml') ? 'application/xml' : 'text/plain; charset=utf-8')
            res.end(file)
            return
          }
        }

        if (url === '/config.js') {
          const env = Object.fromEntries(ENV_KEYS.filter(key => process.env[key] !== undefined).map(key => [key, process.env[key]]))
          res.setHeader('Content-Type', 'text/javascript')
          res.end(`window.__TIDYDOC_ENV__ = ${JSON.stringify(env)}\n`)
          return
        }

        if (url.startsWith('/content/')) {
          const file = resolve(dir, url.slice('/content/'.length))
          if (file.startsWith(dir + sep) && existsSync(file) && statSync(file).isFile()) {
            res.setHeader('Content-Type', MIME[extname(file).toLowerCase()] ?? 'application/octet-stream')
            createReadStream(file).pipe(res)
            return
          }
        }

        if (/\.md$/i.test(url) && existsSync(dir)) {
          const route = url === '/index.md' ? '/' : url.replace(/\.md$/i, '').toLowerCase()
          const match = walk(dir).find(path => path.endsWith('.md') && routeFromPath(path) === route)
          if (match) {
            res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
            res.end(readFileSync(join(dir, match), 'utf8'))
            return
          }
        }

        next()
      })
    },
  }
}
