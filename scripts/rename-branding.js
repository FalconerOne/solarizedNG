/**
 * Safe Project Renamer: SolarizedNG → MyGiveAway
 * ------------------------------------------------
 * Updates common project files (package.json, next.config.js, manifest, env, etc.)
 * with the new brand name and tagline, without touching code logic.
 */

import fs from "fs";
import path from "path";

const oldName = /SolarizedNG/g;
const newName = "MyGiveAway";
const tagline =
  "Join, Win, and track GiveAways that Delight You & Support Charity.";

const files = [
  "package.json",
  "next.config.js",
  "vercel.json",
  "public/manifest.json",
  "README.md",
  "app/layout.tsx",
  "app/head.tsx",
  ".env",
  ".env.example",
];

for (const file of files) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, "utf8");
    let updated = content
      .replace(oldName, newName)
      .replace(
        /Join, Win, and track GiveAways that Delight'?s You & Support'?s Charity\.?/gi,
        tagline
      );
    fs.writeFileSync(filePath, updated, "utf8");
    console.log(`✅ Updated ${file}`);
  } else {
    console.log(`⚠️  Skipped missing file: ${file}`);
  }
}

console.log("\n🎉 Branding rename complete! Run a quick commit next:");
console.log("git add . && git commit -m 'Brand rename: SolarizedNG → MyGiveAway'");
