import { Response } from "express"; 
 import bcrypt from "bcryptjs"; 
 import prisma from "../utils/prisma.js"; 
 import { z } from "zod"; 
 import type { AuthRequest } from "../middleware/auth.js"; 
 
 // ======================= 
 // SCHEMAS 
 // ======================= 
 
 const createUserSchema = z.object({ 
   email: z.string().email(), 
   password: z.string().min(6).optional(), 
   firstName: z.string(), 
   lastName: z.string(), 
   role: z.enum([ 
     "SUPER_ADMIN", 
     "COMPANY_ADMIN", 
     "HR_MANAGER", 
     "HR_ASSISTANT", 
     "EMPLOYEE", 
   ]), 
   companyId: z.string().optional(), 
   jobTitle: z.string().optional(), 
   phone: z.string().optional(), 
   hireDate: z.coerce.date().optional(), 
   status: z.enum(["INVITED", "ACTIVE", "INACTIVE"]).optional(), 
   departmentId: z.string().optional(), 
   managerId: z.string().optional(), 
   baseSalary: z.number().optional(),
   bankDetails: z.string().optional(),
 }); 
 
 const updateUserSchema = createUserSchema.partial(); 
 
 // ======================= 
 // CREATE USER 
 // ======================= 
 
 export const createUser = async (req: AuthRequest, res: Response) => { 
   try { 
     const data = createUserSchema.parse(req.body); 
     const currentUser = req.user; 
 
     if (!currentUser) return res.status(401).json({ message: "Unauthorized" }); 
 
     if (currentUser.role === "HR_ASSISTANT" && data.role !== "EMPLOYEE") { 
       return res.status(403).json({ 
         message: "HR Assistant ne peut créer que des employés.", 
       }); 
     } 
 
     const existingUser = await prisma.user.findUnique({ 
       where: { email: data.email }, 
     }); 
 
     if (existingUser) { 
       return res.status(400).json({ message: "User already exists" }); 
     } 
 
     if (currentUser.role === "SUPER_ADMIN" && !data.companyId) { 
       return res.status(400).json({ 
         message: "companyId requis pour SUPER_ADMIN", 
       }); 
     } 
 
     const rawPassword = 
       data.password && data.password.length >= 6 
         ? data.password 
         : Math.random().toString(36).slice(2) + 
           Math.random().toString(36).slice(2); 
 
     const hashedPassword = await bcrypt.hash(rawPassword, 10); 
 
     const targetCompanyId = 
       currentUser.role === "SUPER_ADMIN" 
         ? data.companyId 
         : currentUser.companyId; 
 
     if ( 
       currentUser.role !== "SUPER_ADMIN" && 
       data.companyId && 
       data.companyId !== currentUser.companyId 
     ) { 
       return res.status(403).json({ 
         message: "Impossible de créer pour une autre entreprise.", 
       }); 
     } 
 
     // Limite employés 
     if (targetCompanyId) { 
       const company = await prisma.company.findUnique({ 
         where: { id: targetCompanyId }, 
         select: { plan: true, _count: { select: { users: true } } }, 
       }); 
 
       if (company) { 
         // La limite d'employés est déjà gérée par le middleware checkEmployeeLimit dans user.routes.ts
       } 
     } 
 
     const user = await prisma.user.create({ 
       data: { 
         email: data.email, 
         password: hashedPassword, 
         firstName: data.firstName, 
         lastName: data.lastName, 
         role: data.role, 
         companyId: targetCompanyId, 
         jobTitle: data.jobTitle || null, 
         phone: data.phone || null, 
         hireDate: data.hireDate || null, 
         status: data.status || "INVITED", 
         departmentId: data.departmentId || null, 
         managerId: data.managerId || null, 
         baseSalary: data.baseSalary || null,
         bankDetails: data.bankDetails || null,
       }, 
     }); 
 
     res.status(201).json({ id: user.id, email: user.email }); 
   } catch (error: any) { 
     if (error instanceof z.ZodError) { 
       return res.status(400).json({ message: "Données invalides", errors: error.issues }); 
     } 
 
     res.status(500).json({ message: "Erreur création utilisateur", error: error.message }); 
   } 
 }; 
 
 // ======================= 
 // GET USERS 
 // ======================= 
 
 export const getUsers = async (req: AuthRequest, res: Response) => { 
   try { 
     const currentUser = req.user; 
     if (!currentUser) return res.status(401).json({ message: "Non authentifié." }); 
 
     const role = req.query.role as string;
     const companyId = req.query.companyId as string;
     const departmentId = req.query.departmentId as string;
 
     const validRoles = [
       "SUPER_ADMIN",
       "COMPANY_ADMIN",
       "HR_MANAGER",
       "HR_ASSISTANT",
       "EMPLOYEE",
     ];
 
     const whereClause: Record<string, any> = {};
 
     if (role && validRoles.includes(role)) {
       whereClause.role = role as string;
     }
 
     if (departmentId) {
       whereClause.departmentId = departmentId as string;
     }
 
     if (currentUser.role === "SUPER_ADMIN") {
       if (companyId) {
         whereClause.companyId = companyId as string;
       } 
     } else { 
       if (!currentUser.companyId) { 
         return res.status(400).json({ message: "Pas d'entreprise liée." }); 
       } 
 
       whereClause.companyId = currentUser.companyId as string; 
       whereClause.NOT = { role: "SUPER_ADMIN" }; 
     } 
 
     const users = await prisma.user.findMany({ 
       where: whereClause, 
       select: { 
         id: true, 
         email: true, 
         firstName: true, 
         lastName: true, 
         role: true, 
         jobTitle: true, 
         phone: true, 
         hireDate: true, 
         status: true, 
         departmentId: true, 
         managerId: true, 
         baseSalary: true,
         bankDetails: true,
       }, 
     }); 
 
     res.json(users); 
   } catch (error: any) { 
     res.status(500).json({ message: "Erreur récupération utilisateurs", error: error.message }); 
   } 
 }; 
 
 // ======================= 
 // UPDATE USER 
 // ======================= 
 
 export const updateUser = async (req: AuthRequest, res: Response) => { 
   try { 
     const { id } = req.params; 
     if (!id) return res.status(400).json({ message: "ID manquant" }); 
 
     const currentUser = req.user; 
     if (!currentUser) return res.status(401).json({ message: "Unauthorized" }); 
 
     const data = updateUserSchema.parse(req.body); 
 
     const targetUser = await prisma.user.findUnique({ where: { id: id as string } }); 
     if (!targetUser) return res.status(404).json({ message: "Utilisateur non trouvé" }); 
 
     const updateData: Record<string, any> = { 
       ...(data.email !== undefined && { email: data.email }), 
       ...(data.firstName !== undefined && { firstName: data.firstName }), 
       ...(data.lastName !== undefined && { lastName: data.lastName }), 
       ...(data.role !== undefined && { role: data.role }), 
       ...(data.companyId !== undefined && { companyId: data.companyId }), 
       ...(data.jobTitle !== undefined && { jobTitle: data.jobTitle }), 
       ...(data.phone !== undefined && { phone: data.phone }), 
       ...(data.hireDate !== undefined && { hireDate: data.hireDate }), 
       ...(data.status !== undefined && { status: data.status }), 
       ...(data.departmentId !== undefined && { departmentId: data.departmentId }), 
       ...(data.managerId !== undefined && { managerId: data.managerId }), 
       ...(data.baseSalary !== undefined && { baseSalary: data.baseSalary }),
       ...(data.bankDetails !== undefined && { bankDetails: data.bankDetails }),
     }; 
 
     if (data.password) { 
       updateData.password = await bcrypt.hash(data.password, 10); 
     } 
 
     const updatedUser = await prisma.user.update({ 
       where: { id: id as string }, 
       data: updateData, 
     }); 
 
     res.json(updatedUser); 
   } catch (error: any) { 
     if (error instanceof z.ZodError) { 
       return res.status(400).json({ message: "Données invalides", errors: error.issues }); 
     } 
 
     res.status(500).json({ message: "Erreur update utilisateur", error: error.message }); 
   } 
 }; 
 
 // ======================= 
 // UPDATE PASSWORD 
 // ======================= 
 
 export const updateUserPassword = async (req: AuthRequest, res: Response) => { 
   try { 
     const { id } = req.params; 
     const { password } = z.object({ password: z.string().min(6) }).parse(req.body); 
 
     const hashedPassword = await bcrypt.hash(password, 10); 
     await prisma.user.update({ 
       where: { id: id as string }, 
       data: { password: hashedPassword }, 
     }); 
 
     res.json({ message: "Mot de passe mis à jour" }); 
   } catch (error: any) { 
     res.status(500).json({ message: "Erreur mise à jour mot de passe", error: error.message }); 
   } 
 }; 
 
 // ======================= 
 // SUSPEND / ACTIVATE 
 // ======================= 
 
 export const suspendUser = async (req: AuthRequest, res: Response) => { 
   try { 
     const { id } = req.params; 
     await prisma.user.update({ 
       where: { id: id as string }, 
       data: { status: "INACTIVE" }, 
     }); 
     res.json({ message: "Utilisateur suspendu" }); 
   } catch (error: any) { 
     res.status(500).json({ message: "Erreur suspension", error: error.message }); 
   } 
 }; 
 
 export const activateUser = async (req: AuthRequest, res: Response) => { 
   try { 
     const { id } = req.params; 
     await prisma.user.update({ 
       where: { id: id as string }, 
       data: { status: "ACTIVE" }, 
     }); 
     res.json({ message: "Utilisateur activé" }); 
   } catch (error: any) { 
     res.status(500).json({ message: "Erreur activation", error: error.message }); 
   } 
 }; 
 
 // ======================= 
 // DELETE USER 
 // ======================= 
 
 export const deleteUser = async (req: AuthRequest, res: Response) => { 
   try { 
     const { id } = req.params; 
     const currentUser = req.user; 
 
     if (!currentUser) return res.status(401).json({ message: "Unauthorized" }); 
     if (!id) return res.status(400).json({ message: "ID manquant" }); 
 
     if (currentUser.id === id) { 
       return res.status(403).json({ message: "Auto-suppression interdite" }); 
     } 
 
     await prisma.user.delete({ where: { id: id as string } }); 
 
     res.json({ message: "Utilisateur supprimé" }); 
   } catch (error: any) { 
     res.status(500).json({ message: "Erreur suppression", error: error.message }); 
   } 
 };