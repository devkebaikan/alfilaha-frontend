import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./src', function(filePath) {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // add loading="lazy" to img tags if not present
    const newContent = content.replace(/<img(?![^>]*loading=)[^>]*>/g, match => {
        if (!match.includes('loading=')) {
           hasChanges = true;
           return match.replace('<img', '<img loading="lazy"');
        }
        return match;
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated: ' + filePath);
    }
  }
});
