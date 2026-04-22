const fs = require('fs');
const archiver = require('archiver');

const createZipFromDirectory = (sourceDir, zipPath) => new Promise((resolve, reject) => {
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  output.on('close', resolve);
  output.on('error', reject);
  archive.on('error', reject);

  archive.pipe(output);
  archive.directory(sourceDir, false);
  archive.finalize();
});

module.exports = {
  createZipFromDirectory
};