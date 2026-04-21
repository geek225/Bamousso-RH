const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      content = content.replace(/prisma\.school/g, 'prisma.company');
      content = content.replace(/prisma\.class/g, 'prisma.department');
      content = content.replace(/schoolId/g, 'companyId');
      content = content.replace(/classId/g, 'departmentId');
      content = content.replace(/school\.routes/g, 'company.routes');
      content = content.replace(/class\.routes/g, 'department.routes');
      
      fs.writeFileSync(fullPath, content);
      
      if (file.includes('school.')) {
        fs.renameSync(fullPath, fullPath.replace('school.', 'company.'));
      } else if (file.includes('class.')) {
        fs.renameSync(fullPath, fullPath.replace('class.', 'department.'));
      }
    }
  }
}

replaceInDir('./src');
