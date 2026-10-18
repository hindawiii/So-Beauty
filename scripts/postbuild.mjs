import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const clientDir = path.join(distDir, "client");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 1. If clientDir exists, copy static assets directly into dist root
if (fs.existsSync(clientDir)) {
  const entries = fs.readdirSync(clientDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(clientDir, entry.name);
    const destPath = path.join(distDir, entry.name);
    if (!fs.existsSync(destPath)) {
      fs.cpSync(srcPath, destPath, { recursive: true });
    }
  }
}

// 2. Discover bundle files in dist/assets
const assetsDir = path.join(distDir, "assets");
let cssFileName = "";
let jsFileName = "";

if (fs.existsSync(assetsDir)) {
  const assetFiles = fs.readdirSync(assetsDir);
  const cssFiles = assetFiles.filter((f) => f.endsWith(".css"));
  const jsFiles = assetFiles.filter((f) => f.startsWith("index-") && f.endsWith(".js"));

  if (cssFiles.length > 0) cssFileName = cssFiles[0];
  if (jsFiles.length > 0) jsFileName = jsFiles[0];
}

// 3. Generate a robust, valid index.html for static hosting fallbacks
const indexHtmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>سو بيوتي (So Beauty) — متجر منتجات العناية الطبيعية بالبشرة</title>
  <meta name="description" content="متجر سو بيوتي لمنتجات العناية الطبيعية بالبشرة في السودان — تشكيلة مختارة من السيرومات والمرطبات الطبيعية مع الدفع عند الاستلام والشحن السريع لجميع المدن." />
  <meta property="og:title" content="سو بيوتي (So Beauty) — متجر منتجات العناية الطبيعية بالبشرة" />
  <meta property="og:description" content="متجر سو بيوتي لمنتجات العناية الطبيعية بالبشرة في السودان — تشكيلة مختارة من السيرومات والمرطبات الطبيعية مع الدفع عند الاستلام والشحن السريع لجميع المدن." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="/favicon.ico" type="image/x-icon" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&family=El+Messiri:wght@500;600;700&family=Playfair+Display:wght@600;700;900&display=swap" />
  ${cssFileName ? `<link rel="stylesheet" href="/assets/${cssFileName}" />` : ""}
</head>
<body>
  <div id="root"></div>
  ${jsFileName ? `<script type="module" src="/assets/${jsFileName}"></script>` : ""}
</body>
</html>
`;

fs.writeFileSync(path.join(distDir, "index.html"), indexHtmlContent, "utf8");
if (fs.existsSync(clientDir)) {
  fs.writeFileSync(path.join(clientDir, "index.html"), indexHtmlContent, "utf8");
}

console.log("Postbuild completed successfully: dist artifacts and index.html generated.");
