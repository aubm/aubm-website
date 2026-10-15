import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const directory = process.argv[2] || 'static/images/photos';
const files = readdirSync(directory);
assert.ok(files.length > 0, 'The sanitized photo directory must not be empty.');
const allowedChunks = new Set(['VP8 ', 'VP8L', 'VP8X', 'ALPH']);

for (const file of files) {
  assert.match(
    file,
    /^[a-z]+(?:-[a-z]+)*\.webp$/,
    'Use neutral names without dates or camera filenames.',
  );
  const image = readFileSync(path.join(directory, file));
  assert.equal(image.toString('ascii', 0, 4), 'RIFF', `${file}: WebP container`);
  assert.equal(image.toString('ascii', 8, 12), 'WEBP', `${file}: WebP signature`);
  assert.equal(image.readUInt32LE(4) + 8, image.length, `${file}: no appended data`);
  let offset = 12;
  let pixels = false;
  while (offset < image.length) {
    assert.ok(offset + 8 <= image.length, `${file}: complete chunk header`);
    const chunk = image.toString('ascii', offset, offset + 4);
    const size = image.readUInt32LE(offset + 4);
    assert.ok(
      allowedChunks.has(chunk),
      `${file}: unexpected chunk ${chunk}; metadata is not allowed`,
    );
    assert.ok(offset + 8 + size <= image.length, `${file}: complete chunk payload`);
    if (chunk === 'VP8X') {
      assert.equal(size, 10, `${file}: extended header size`);
      assert.equal(image[offset + 8] & 0x2c, 0, `${file}: no ICC, EXIF or XMP metadata flags`);
    }
    if (chunk === 'VP8 ' || chunk === 'VP8L') pixels = true;
    offset += 8 + size + (size % 2);
  }
  assert.equal(offset, image.length, `${file}: no trailing data`);
  assert.ok(pixels, `${file}: image pixels exist`);
}
console.log(
  `Verified ${files.length} published photo files: image data only; no EXIF/GPS, XMP, IPTC, ICC, comments or appended metadata.`,
);
