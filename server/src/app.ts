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
import superAdminRoutes from "./routes/superadmin.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import cronRoutes from "./routes/cron.routes.js";
import salariesRoutes from "./routes/salaries.routes.js";
import suggestionsRoutes from "./routes/suggestions.routes.js";
import explanationRoutes from "./routes/explanation.routes.js";
import taskRoutes from "./routes/task.routes.js";
import messageRoutes from "./routes/message.routes.js";

// Chargement des variables d'environnement
dotenv.config();

const app = express();

// --- Configuration des Middlewares ---

// Configuration de CORS : Autorise les requêtes provenant du frontend
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://bamousso-client.vercel.app'] 
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
app.use("/api/payment", paymentRoutes);           // Paiements et Webhooks
app.use("/api/admin", superAdminRoutes);               // SUPER_ADMIN & changement de mot de passe
app.use("/api/analytics", analyticsRoutes);            // Analytics RH (Bamousso+)
app.use("/api/cron", cronRoutes);                      // Tâches planifiées (Subscription check)
app.use("/api/salaries", salariesRoutes);
app.use("/api/suggestions", suggestionsRoutes);
app.use("/api/explanations", explanationRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/messages", messageRoutes);

// Route de test pour vérifier que l'API est en ligne
app.get("/", (req, res) => {
  res.json({ message: "API Bamousso is running" });
});

export default app;
