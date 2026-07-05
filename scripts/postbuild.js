const fs = require('fs');
const path = require('path');

function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const nextDir = path.join(__dirname, '.next');
const standaloneDir = path.join(nextDir, 'standalone');

// Copy .next/static -> .next/standalone/.next/static
const staticSrc = path.join(nextDir, 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');
if (fs.existsSync(staticSrc)) {
  copyDirSync(staticSrc, staticDest);
  console.log('Copied .next/static -> standalone');
}

// Copy public -> .next/standalone/public
const publicSrc = path.join(__dirname, 'public');
const publicDest = path.join(standaloneDir, 'public');
if (fs.existsSync(publicSrc)) {
  copyDirSync(publicSrc, publicDest);
  console.log('Copied public -> standalone');
}

// Copy db -> .next/standalone/db
const dbSrc = path.join(__dirname, 'db');
const dbDest = path.join(standaloneDir, 'db');
if (fs.existsSync(dbSrc)) {
  copyDirSync(dbSrc, dbDest);
  console.log('Copied db -> standalone');
}

// Copy prisma schema -> .next/standalone/prisma
const prismaSrc = path.join(__dirname, 'prisma');
const prismaDest = path.join(standaloneDir, 'prisma');
if (fs.existsSync(prismaSrc)) {
  copyDirSync(prismaSrc, prismaDest);
  console.log('Copied prisma -> standalone');
}

console.log('Build artifacts copied successfully');
