const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT_DIR = path.resolve(__dirname, "..");
const EXCLUDED_DIRS = new Set(["node_modules", ".git"]);

function walk(dirPath, collected = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) {
        walk(fullPath, collected);
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".js")) {
      collected.push(fullPath);
    }
  }

  return collected;
}

function main() {
  const files = walk(ROOT_DIR).sort();

  if (files.length === 0) {
    throw new Error("No JavaScript files found for smoke check");
  }

  for (const file of files) {
    execFileSync(process.execPath, ["--check", file], {
      stdio: "inherit",
    });
  }

  console.log(`Smoke check passed for ${files.length} server files.`);
}

main();
