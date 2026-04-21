/**
 * Point d'entrée principal de l'application Express.
 * Configure les middlewares, les routes et la politique de sécurité.
 */
import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

// Importation des routes
import authRoutes from "./routes/auth.routes.js";
import companyRoutes from "./routes/company.routes.js";
import userRoutes from "./routes/user.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import documentRoutes from "./routes/document.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

// Chargement des variables d'environnement
dotenv.config();

const app = express();

// --- Configuration des Middlewares ---

// Configuration de CORS : Autorise les requêtes provenant du frontend
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://nexteam-client.vercel.app'] 
    : true, // En développement, on autorise tout (ou strictement localhost)
  credentials: true
}));

// Sécurisation des headers HTTP avec Helmet
app.use((helmet as any)({ crossOriginResourcePolicy: false }));

// Journalisation des requêtes HTTP en mode développement
app.use(morgan("dev"));

// Analyse du corps des requêtes en format JSON
app.use(express.json());

// --- Gestion des fichiers statiques ---
// Note : Pour Vercel, les fichiers locaux ne persistent pas. 
// La migration vers Supabase Storage est privilégiée pour la production.
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// --- Définition des Routes API ---
app.use("/api/auth", authRoutes);           // Authentification (Login, Register)
app.use("/api/companies", companyRoutes);     // Gestion des entreprises
app.use("/api/employees", userRoutes);         // Annuaire employés (CRUD)
app.use("/api/departments", departmentRoutes);       // Départements
app.use("/api/notifications", notificationRoutes); // Notifications et annonces
app.use("/api/leaves", leaveRoutes);            // Gestion des congés
app.use("/api/attendances", attendanceRoutes);  // Pointage
app.use("/api/documents", documentRoutes);      // Fiches de paie / Contrats
app.use("/api/announcements", announcementRoutes); // Communications internes
app.use("/api/payments", paymentRoutes);           // Paiements GeniusPay

// Route de test pour vérifier que l'API est en ligne
app.get("/", (req, res) => {
  res.json({ message: "API NexTeam is running" });
});

export default app;
