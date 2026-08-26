import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = './public/images';
const maxDimension = 1920; // Full HD dimension for high quality

async function processImages() {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Process files larger than 150KB
    if (stat.size > 150 * 1024) {
      console.log(`Compressing ${file} (${(stat.size / 1024).toFixed(2)} KB)...`);
      const tempPath = filePath + '.tmp';
      try {
        const isPng = file.toLowerCase().endsWith('.png');
        
        let sharpInstance = sharp(filePath).resize({ width: maxDimension, withoutEnlargement: true });
        
        if (isPng) {
          sharpInstance = sharpInstance.png({ quality: 80, compressionLevel: 8 });
        } else {
          sharpInstance = sharpInstance.jpeg({ quality: 85, mozjpeg: true });
        }
        
        await sharpInstance.toFile(tempPath);
        
        fs.renameSync(tempPath, filePath);
        const newStat = fs.statSync(filePath);
        console.log(`-> Reduced to ${(newStat.size / 1024).toFixed(2)} KB`);
      } catch (err) {
        console.error(`Failed to compress ${file}:`, err);
      }
    }
  }
}

processImages();
