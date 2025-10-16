// scripts/repoSnapshot.mjs
// Generates a clean tree view of your repo's structure (without node_modules noise)
import fs from "fs";
import path from "path";

const ignore = [
  "node_modules",
  ".next",
  ".git",
  ".vercel",
  ".vscode",
  ".env",
  ".env.local",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  ".DS_Store",
  "dist",
  "build",
  ".turbo",
  ".output",
];

function listDir(dir, prefix = "") {
  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => !ignore.includes(entry.name));

  let tree = "";

  entries.forEach((entry, idx) => {
    const isLast = idx === entries.length - 1;
    const connector = isLast ? "└─" : "├─";
    const newPrefix = prefix + (isLast ? "  " : "│ ");
    const filePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      tree += `${prefix}${connector} ${entry.name}/\n`;
      tree += listDir(filePath, newPrefix);
    } else {
      tree += `${prefix}${connector} ${entry.name}\n`;
    }
  });

  return tree;
}

const rootDir = process.cwd();
const structure = listDir(rootDir);
fs.writeFileSync("repo_structure.txt", structure);
console.log("✅ Repo snapshot generated → repo_structure.txt");
