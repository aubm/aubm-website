import { archiveDigest } from './archive.mjs';

// Baseline captured before the redesign. Updating articles is a separate task.
export const originalDigest = '9a75e4ee87393095e978e82df981ae1d12f75cc8c8d09a60b79bc62844306010';
if (archiveDigest() !== originalDigest) {
  throw new Error('Original content/posts files changed. Keep archive edits in a separate PR.');
}
console.log('Original archive verified: all post sources and bundled assets are unchanged.');
