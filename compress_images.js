import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = './public/images';
const maxDimension = 1080;

async function processImages() {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Process files larger than 100KB
    if (stat.size > 100 * 1024) {
      console.log(`Compressing ${file} (${(stat.size / 1024).toFixed(2)} KB)...`);
      const tempPath = filePath + '.tmp';
      try {
        await sharp(filePath)
          .resize({ width: maxDimension, withoutEnlargement: true })
          .jpeg({ quality: 60, progressive: true })
          .toFile(tempPath);
        
        fs.renameSync(tempPath, filePath);
        const newStat = fs.statSync(filePath);
        console.log(`-> Reduced to ${(newStat.size / 1024 / 1024).toFixed(2)} MB`);
      } catch (err) {
        console.error(`Failed to compress ${file}:`, err);
      }
    }
  }
}

processImages();
