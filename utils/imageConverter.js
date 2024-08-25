const sharp = require('sharp');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
// const fs = require('fs');
const heicConvert = require('heic-convert');

/**
 * Converts HEIC images to JPG format.
 * @param {string} filePath - Path to the HEIC file.
 * @returns {Promise<string>} - Promise that resolves with the path of the converted JPG file or original path if conversion fails.
 */
const convertHeicToJpg = async (filePath) => {
  try {
    if (!filePath.endsWith('.heic') && !filePath.endsWith('.HEIC')) {
      console.log(`File is not a HEIC image, skipping conversion: ${filePath}`);
      return filePath; // Return original filePath if not a HEIC file
    }

    let outputPath = filePath.replace(/\.HEIC$/, '.jpg');
    outputPath = outputPath.replace(/\.heic$/, '.jpg');

    (async () => {
      const inputBuffer = fs.readFileSync(filePath);
      const outputBuffer = await heicConvert({
        buffer: inputBuffer, // the HEIC file buffer
        format: 'JPEG',      // output format
        quality: 90          // the jpeg compression quality, between 0 and 1
      });
      // fs.writeFileSync(outputPath, outputBuffer);
      fs.unlinkSync(filePath);
      await promisify(fs.writeFile)(outputPath, outputBuffer);
    })();


    
    return outputPath;
  } catch (error) {
    console.error(`Error converting HEIC to JPG: ${error.message}`);
    console.error(error.stack);
    // Log a friendly message indicating the file could not be converted and suggest manual conversion or using a different format
    console.log(`Unable to convert HEIC to JPG for file: ${filePath}. Please consider manually converting the file or using a different format.`);
    // Return the original filePath if conversion fails, allowing the application to continue without halting execution
    return filePath;
  }
};

module.exports = {
  convertHeicToJpg
};