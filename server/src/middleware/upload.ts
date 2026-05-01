import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Use memory storage for serverless environments (Vercel)
// Disk storage is not reliable in serverless functions as the filesystem is ephemeral and read-only
const storage = multer.memoryStorage();

// File filter to restrict file types
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
    'text/plain',
    'text/csv'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé : ${file.mimetype}. Seuls les documents, images et vidéos sont acceptés.`), false);
  }
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});
