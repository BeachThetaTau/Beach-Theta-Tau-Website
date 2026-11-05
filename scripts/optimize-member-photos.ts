/**
 * Generates web-sized member photos.
 *
 *   npx tsx scripts/optimize-member-photos.ts
 *
 * For every photo in `apps/web/src/shared/assets/members/Brothers/`:
 *   - writes a 400px-wide thumbnail to `members/BrothersThumbs/` (member grid)
 *   - downsizes the photo in place to 900px wide (member details modal)
 *
 * It also downsizes the Brothers-page hero banners (`marketing/`) to 2400px wide.
 *
 * Images already at or below the target width are left untouched, so the script
 * is safe to re-run after dropping in new full-size photos.
 */
import { mkdir, readdir, rename, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const membersDir = path.join(root, "apps/web/src/shared/assets/members");
const fullDir = path.join(membersDir, "Brothers");
const thumbDir = path.join(membersDir, "BrothersThumbs");

const FULL_WIDTH = 900;
const THUMB_WIDTH = 400;
const HERO_WIDTH = 2400;
const HERO_FILES = ["Eboard.JPG", "Eboard2.JPG", "Brothers.jpg"];
const SKIP = new Set(["blank-pfp.webp", "blankpfp.webp"]);

const kb = (bytes: number) => `${Math.round(bytes / 1024)} KB`;

await mkdir(thumbDir, { recursive: true });

let before = 0;
let after = 0;

for (const file of (await readdir(fullDir)).filter((name) => name.endsWith(".webp"))) {
  if (SKIP.has(file)) continue;

  const source = path.join(fullDir, file);
  const sizeBefore = (await stat(source)).size;
  const { width = 0 } = await sharp(source).metadata();

  await sharp(source)
    .rotate()
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(path.join(thumbDir, file));

  if (width > FULL_WIDTH) {
    const temp = `${source}.tmp`;
    await sharp(source)
      .rotate()
      .resize({ width: FULL_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(temp);
    await rename(temp, source);
  }

  const sizeAfter = (await stat(source)).size;
  const thumbSize = (await stat(path.join(thumbDir, file))).size;
  before += sizeBefore;
  after += sizeAfter + thumbSize;
  console.log(`${file}: ${kb(sizeBefore)} -> ${kb(sizeAfter)} (+ ${kb(thumbSize)} thumb)`);
}

console.log(`\nTotal: ${kb(before)} -> ${kb(after)} (incl. thumbnails)`);

for (const file of HERO_FILES) {
  const source = path.join(membersDir, "..", "marketing", file);
  const sizeBefore = (await stat(source)).size;
  const { width = 0 } = await sharp(source).metadata();
  if (width <= HERO_WIDTH) continue;

  const temp = `${source}.tmp`;
  await sharp(source)
    .rotate()
    .resize({ width: HERO_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(temp);
  await rename(temp, source);
  console.log(`${file}: ${kb(sizeBefore)} -> ${kb((await stat(source)).size)}`);
}
