import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database for HR SaaS...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Super Admin
  const superAdminEmail = 'superadmin@example.com';
  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: { password: hashedPassword, firstName: 'Super', lastName: 'Admin', role: 'SUPER_ADMIN' },
    create: { email: superAdminEmail, password: hashedPassword, firstName: 'Super', lastName: 'Admin', role: 'SUPER_ADMIN' },
  });
  console.log('Upserted Super Admin:', superAdmin.email);

  // 2. Create Company
  const companyName = 'TechCorp Inc.';
  let company = await prisma.company.findFirst({ where: { name: companyName } });

  if (!company) {
    company = await prisma.company.create({
      data: { name: companyName, address: 'Paris, France', isActive: true },
    });
    console.log('Created Company:', company.name);
  }

  // 3. Create Department
  const deptName = 'Ressources Humaines';
  let department = await prisma.department.findFirst({ where: { name: deptName, companyId: company.id } });
  
  if (!department) {
    department = await prisma.department.create({
      data: { name: deptName, companyId: company.id }
    });
    console.log('Created Department:', department.name);
  }

  // 4. Create Company Admin (PDG)
  const companyAdminEmail = 'admin@techcorp.com';
  const companyAdmin = await prisma.user.upsert({
    where: { email: companyAdminEmail },
    update: { password: hashedPassword, firstName: 'Directeur', lastName: 'Général', role: 'COMPANY_ADMIN', companyId: company.id },
    create: { email: companyAdminEmail, password: hashedPassword, firstName: 'Directeur', lastName: 'Général', role: 'COMPANY_ADMIN', companyId: company.id }
  });
  console.log('Upserted Company Admin:', companyAdmin.email);

  // 5. Create HR Manager
  const hrManagerEmail = 'hr@techcorp.com';
  const hrManager = await prisma.user.upsert({
    where: { email: hrManagerEmail },
    update: { password: hashedPassword, firstName: 'Responsable', lastName: 'RH', role: 'HR_MANAGER', companyId: company.id, departmentId: department.id },
    create: { email: hrManagerEmail, password: hashedPassword, firstName: 'Responsable', lastName: 'RH', role: 'HR_MANAGER', companyId: company.id, departmentId: department.id }
  });
  console.log('Upserted HR Manager:', hrManager.email);

  // 6. Create Employee
  const employeeEmail = 'employe@techcorp.com';
  const employee = await prisma.user.upsert({
    where: { email: employeeEmail },
    update: { password: hashedPassword, firstName: 'Jean', lastName: 'Dupont', role: 'EMPLOYEE', companyId: company.id },
    create: { email: employeeEmail, password: hashedPassword, firstName: 'Jean', lastName: 'Dupont', role: 'EMPLOYEE', companyId: company.id }
  });
  console.log('Upserted Employee:', employee.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
