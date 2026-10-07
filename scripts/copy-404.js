import fs from "node:fs"
import path from "node:path"

const distDir = path.resolve(import.meta.dirname, "../dist")
const indexPath = path.join(distDir, "index.html")
const notFoundPath = path.join(distDir, "404.html")

if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, notFoundPath)
  console.log("Successfully created dist/404.html for GitHub Pages SPA routing.")
} else {
  console.warn("dist/index.html not found, skipping 404.html copy.")
}
