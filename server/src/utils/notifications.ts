import prisma from "./prisma.js";

export const createNotification = async (data: {
  title: string;
  message: string;
  userId?: string;
  companyId?: string;
}) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        userId: data.userId,
        companyId: data.companyId,
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

/**
 * Notifie tous les administrateurs d'une entreprise
 */
export const notifyAdmins = async (companyId: string, title: string, message: string) => {
  try {
    const admins = await prisma.user.findMany({
      where: {
        companyId,
        role: { in: ["COMPANY_ADMIN", "HR_MANAGER", "HR_ASSISTANT"] }
      },
      select: { id: true }
    });

    const notifications = await Promise.all(
      admins.map(admin => 
        prisma.notification.create({
          data: {
            title,
            message,
            userId: admin.id,
            companyId
          }
        })
      )
    );
    return notifications;
  } catch (error) {
    console.error("Error notifying admins:", error);
    return [];
  }
};
