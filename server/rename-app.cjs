const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  content = content.replace(/École Connectée/g, 'NexTeam');
  content = content.replace(/Ecole Connectée/g, 'NexTeam');
  content = content.replace(/ecole-connecte/g, 'nexteam');
  content = content.replace(/ecole connecte/gi, 'NexTeam');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  }
}

const filesToUpdate = [
  path.join(__dirname, '../client/index.html'),
  path.join(__dirname, '../client/package.json'),
  path.join(__dirname, '../client/src/pages/Login.tsx'),
  path.join(__dirname, '../server/package.json'),
  path.join(__dirname, '../server/src/app.ts'),
];

filesToUpdate.forEach(replaceInFile);
console.log('Renaming done.');
