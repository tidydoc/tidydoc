import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'
import type { Plugin } from 'vite'
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

/**
 * Dev-only equivalent of docker/entrypoint.sh + generate.sh + nginx.conf:
 * serves /content.json, /config.js, raw `/<route>.md` and `/content/*` assets from a local folder.
 */
export function contentPlugin (options: { dir: string }): Plugin {
  let dir = ''

  return {
    name: 'tidydoc-content',
    apply: 'serve',
    configResolved (config) {
      dir = resolve(config.root, options.dir)
    },
    configureServer (server) {
      server.watcher.add(dir)
      server.watcher.on('all', (_event, file) => {
        if (file.startsWith(dir) && /(\.md|_meta\.json)$/i.test(file)) server.ws.send({ type: 'full-reload' })
      })

      server.middlewares.use((req, res, next) => {
        const url = decodeURIComponent((req.url ?? '').split('?')[0]!)

        if (url === '/content.json') {
          const files = existsSync(dir) ? walk(dir) : []
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ files: files.map(path => ({ path, raw: readFileSync(join(dir, path), 'utf8') })) }))
          return
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
