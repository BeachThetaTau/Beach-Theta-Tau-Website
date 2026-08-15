type AssetModule = string;

const modules = import.meta.glob<AssetModule>("../assets/**/*.{png,jpg,jpeg,JPG,webp,svg}", {
  eager: true,
  import: "default",
  query: "?url",
});

const assets = new Map<string, string>();
const warnedMissingAssets = new Set<string>();

for (const [path, url] of Object.entries(modules)) {
  const normalizedPath = path.replace(/^\.\.\/assets\//, "");
  const basename = normalizedPath.split("/").at(-1);

  assets.set(normalizedPath, url);
  if (basename && !assets.has(basename)) assets.set(basename, url);

  const brothersIndex = normalizedPath.indexOf("Brothers/");
  if (brothersIndex >= 0) assets.set(normalizedPath.slice(brothersIndex), url);
}

export function assetUrl(name: string): string {
  const normalized = name.replace(/^\.?\//, "");
  const resolved = assets.get(normalized) ?? assets.get(normalized.split("/").at(-1) ?? "");

  if (!resolved) {
    if (!warnedMissingAssets.has(normalized)) {
      warnedMissingAssets.add(normalized);
      console.warn(`Asset not found: ${name}`);
    }
    return "";
  }

  return resolved;
}
