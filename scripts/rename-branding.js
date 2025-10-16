/**
 * Rename Branding Script
 * -----------------------------------------------------------
 * Safely updates all user-facing references from old brand name
 * (e.g. "SolarizedNG") to new name (e.g. "MyGiveAway")
 * without touching internal envs or backend identifiers.
 *
 * Usage:
 *   node scripts/rename-branding.js "MyGiveAway"
 */

import fs from "fs";
import path from "path";

const root = process.cwd();
const newName = process.argv[2];

if (!newName) {
  console.error("❌ Please provide a new brand name, e.g. `node scripts/rename-branding.js MyGiveAway`");
  process.exit(1);
}

const OLD_NAME = "SolarizedNG";
const TARGET_FILES = [
  "package.json",
  "public/manifest.json",
  "next.config.js",
  "app/layout.tsx",
  "app/head.tsx",
  "app/page.tsx",
];

function replaceInFile(filePath) {
  try {
    const absPath = path.join(root, filePath);
    if (!fs.existsSync(absPath)) return;

    const content = fs.readFileSync(absPath, "utf8");
    if (!content.includes(OLD_NAME)) return;

    const updated = content.replace(new RegExp(OLD_NAME, "g"), newName);
    fs.writeFileSync(absPath, updated, "utf8");
    console.log(`✅ Updated: ${filePath}`);
  } catch (err) {
    console.error(`⚠️ Error updating ${filePath}:`, err.message);
  }
}

console.log(`\n🔄 Starting brand rename: ${OLD_NAME} → ${newName}\n`);

TARGET_FILES.forEach(replaceInFile);

console.log("\n✨ Branding update complete!");
console.log("👉 Review changes and commit them to GitHub.\n");
