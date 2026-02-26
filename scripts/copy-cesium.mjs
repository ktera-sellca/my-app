import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const cesiumSource = join(root, "node_modules", "cesium", "Build", "Cesium");
const dest = join(root, "public", "cesiumStatic");

const dirs = ["Workers", "ThirdParty", "Assets", "Widgets"];

if (!existsSync(dest)) {
  mkdirSync(dest, { recursive: true });
}

for (const dir of dirs) {
  const src = join(cesiumSource, dir);
  const target = join(dest, dir);
  if (existsSync(src)) {
    cpSync(src, target, { recursive: true });
    console.log(`Copied: cesium/${dir} → public/cesiumStatic/${dir}`);
  } else {
    console.warn(`Warning: ${src} not found`);
  }
}

console.log("Cesium static files copied successfully.");
