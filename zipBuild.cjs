const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { execSync } = require("child_process");

const sourceDir = path.join(__dirname, ".build");
const outputZip = path.join(__dirname, ".serverless/techronin-graphql.zip");

// Install production dependencies
console.log("Installing production dependencies...");
execSync("npm ci --only=production");

const output = fs.createWriteStream(outputZip);
const archive = archiver("zip", {
  zlib: { level: 9 }, // Sets the compression level.
});

output.on("close", () => {
  console.log(`ZIP archive created: ${outputZip}`);

  // Restore original node_modules folder
  console.log("Restoring original node_modules folder...");
  execSync("npm ci");
});

archive.on("warning", (err) => {
  if (err.code === "ENOENT") {
    console.warn(err);
  } else {
    throw err;
  }
});

archive.on("error", (err) => {
  throw err;
});

archive.pipe(output);

// Append files and folders from the .build folder
fs.readdirSync(sourceDir).forEach((item) => {
  const itemPath = path.join(sourceDir, item);
  const isDirectory = fs.lstatSync(itemPath).isDirectory();

  if (isDirectory) {
    archive.directory(itemPath, item);
  } else {
    archive.file(itemPath, { name: item });
  }
});

// Include config.yaml and package.json from the root directory
archive.file(path.join(__dirname, "config.yaml"), { name: "config.yaml" });
archive.file(path.join(__dirname, "package.json"), { name: "package.json" });

// Include production node_modules
const productionNodeModules = path.join(__dirname, "node_modules");
archive.directory(productionNodeModules, "node_modules");

archive.finalize();
