const fs = require("node:fs");
const { join, relative } = require("node:path");
const { execSync } = require("node:child_process");

// Paths
const rootDir = __dirname;
const buildDir = join(rootDir, "build");
const outputZip = join(rootDir, "function.zip");

// Recreate build directory
if (fs.existsSync(buildDir)) {
  fs.rmSync(buildDir, { recursive: true, force: true });
}

fs.mkdirSync(buildDir);

// Copy source files
const recursiveCopy = (src, dest) => {
  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });

    const items = fs.readdirSync(src);

    for (const item of items) {
      const srcItem = join(src, item);
      const destItem = join(dest, item);

      recursiveCopy(srcItem, destItem);
    }
  } else {
    fs.copyFileSync(src, dest);
  }
};

recursiveCopy(join(rootDir, "index.js"), join(buildDir, "index.js"));
recursiveCopy(join(rootDir, "package.json"), join(buildDir, "package.json"));
recursiveCopy(join(rootDir, "src"), join(buildDir, "src"));

// Process package.json
const packageJsonPath = join(buildDir, "package.json");
const packageData = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
const keysToRemove = ["name", "version", "type", "scripts", "devDependencies"];

for (const key of keysToRemove) {
  delete packageData[key];
}

fs.writeFileSync(packageJsonPath, JSON.stringify(packageData, null, 2));

// Create a zip file for upload
const getAllFiles = (dirPath, arrayOfFiles = []) => {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
};

const forZippingFiles = getAllFiles(buildDir);
const relativePaths = forZippingFiles.map((fullPath) =>
  relative(buildDir, fullPath)
);

execSync(`npx bestzip ${outputZip} ${relativePaths.join(" ")}`, {
  cwd: rootDir,
  stdio: "inherit",
  stdio: "ignore",
});

console.log(`✅ Created zip: ${outputZip}`);

// Delete the build directory
if (fs.existsSync(buildDir)) {
  fs.rmSync(buildDir, { recursive: true, force: true });
}
