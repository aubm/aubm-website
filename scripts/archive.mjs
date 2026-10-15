import { readdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

export const postsDirectory = path.resolve('content/posts');
export function walk(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((item) => {
      const full = path.join(directory, item.name);
      return item.isDirectory() ? walk(full) : [full];
    })
    .sort();
}
export function postLocation(filename) {
  const relative = path.relative(postsDirectory, filename).split(path.sep).join('/');
  const language = /\.fr\.md$/.test(relative) ? 'fr' : 'en';
  const id = relative.replace(/(?:\/index)?(?:\.fr)?\.md$/, '');
  return { id, language, url: `${language === 'fr' ? '/fr' : ''}/posts/${id}/` };
}
export function bundleAssets() {
  const files = walk(postsDirectory);
  return files
    .filter((file) => !file.endsWith('.md'))
    .flatMap((source) => {
      const relative = path.relative(postsDirectory, source).split(path.sep).join('/');
      const bundle = relative.split('/')[0];
      return files
        .filter(
          (file) =>
            path.dirname(file) === path.join(postsDirectory, bundle) &&
            /\/index(?:\.fr)?\.md$/.test(file),
        )
        .map((file) => {
          const post = postLocation(file);
          return { source, url: `${post.url}${relative.slice(bundle.length + 1)}` };
        });
    });
}
export function archiveDigest() {
  const hash = createHash('sha256');
  for (const file of walk(postsDirectory)) {
    const relative = path.relative(process.cwd(), file).split(path.sep).join('/');
    hash.update(relative + '\0');
    hash.update(createHash('sha256').update(readFileSync(file)).digest());
  }
  return hash.digest('hex');
}
