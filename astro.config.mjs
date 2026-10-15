import { defineConfig } from 'astro/config';
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { bundleAssets } from './scripts/archive.mjs';

// Hugo leaf-bundle media keeps its established, language-specific public URL.
const media = bundleAssets();
export default defineConfig({
  site: 'https://www.aubm.net',
  output: 'static',
  publicDir: './static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  integrations: [
    {
      name: 'preserve-post-media',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          for (const asset of media) {
            const destination = new URL(`.${asset.url}`, dir);
            await mkdir(fileURLToPath(new URL('.', destination)), { recursive: true });
            await copyFile(asset.source, destination);
          }
        },
      },
    },
  ],
  vite: {
    plugins: [
      {
        name: 'serve-post-media',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const asset = media.find((item) => item.url === req.url?.split('?')[0]);
            if (!asset) return next();
            const types = {
              '.jpeg': 'image/jpeg',
              '.jpg': 'image/jpeg',
              '.png': 'image/png',
              '.webp': 'image/webp',
              '.gif': 'image/gif',
            };
            try {
              res.setHeader(
                'Content-Type',
                types[asset.source.match(/\.[^.]+$/)?.[0]] || 'application/octet-stream',
              );
              res.end(await readFile(asset.source));
            } catch (error) {
              next(error);
            }
          });
        },
      },
    ],
  },
});
