const fs = require("fs").promises;
const path = require('path');

const removeFile = async (filePath) => {
  try {
    const normalizedPath = path.normalize(filePath);

    await fs.access(normalizedPath);

    // Remove the file
    await fs.unlink(normalizedPath);
    console.log(`Successfully removed file: ${normalizedPath}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`File not found, skipping removal: ${filePath}`);
      return;
    }
    // Re-throw other errors
    throw error;
  }
};

module.exports = removeFile;
