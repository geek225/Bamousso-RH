import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Bamousso RH <onboarding@resend.dev>', // Sera à changer une fois le domaine vérifié sur Resend
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Bamousso',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 24px;">
          <h2 style="color: #ff5722; text-align: center;">Bamousso RH</h2>
          <p>Bonjour,</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Bamousso.</p>
          <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable pendant 1 heure.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #ff5722; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold;">Réinitialiser mon mot de passe</a>
          </div>
          <p style="color: #64748b; font-size: 14px;">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Bamousso RH. Fait avec fierté en Côte d'Ivoire.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error sending email:', err);
    return { success: false, error: err };
  }
};
export const sendSubscriptionConfirmation = async (email: string, companyName: string, plan: string, amount: number, pdfBuffer?: Buffer) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Bamousso RH <onboarding@resend.dev>',
      to: email,
      subject: `Félicitations ! Votre abonnement Bamousso ${plan} est activé`,
      attachments: pdfBuffer ? [{ filename: `Abonnement_Bamousso_${companyName}.pdf`, content: pdfBuffer }] : [],
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ff5722; margin: 0;">BAMOUSSO RH</h1>
            <p style="color: #64748b; font-weight: bold;">Le Manager de votre Entreprise</p>
          </div>
          
          <h2 style="color: #1e293b; text-align: center;">Bienvenue dans l'aventure, ${companyName} !</h2>
          <p style="color: #475569; line-height: 1.6;">Nous sommes ravis de vous confirmer que votre abonnement à la formule <strong>${plan}</strong> a été activé avec succès.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 16px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Formule :</strong> ${plan}</p>
            <p style="margin: 5px 0;"><strong>Montant réglé :</strong> ${amount.toLocaleString()} FCFA</p>
            <p style="margin: 5px 0;"><strong>Durée :</strong> 1 an (Activation Automatique)</p>
          </div>

          <p style="color: #475569; line-height: 1.6;">Vous pouvez dès maintenant vous connecter à votre tableau de bord avec les identifiants que vous avez enregistrés lors de votre inscription.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" style="background-color: #ff5722; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">Accéder à mon tableau de bord</a>
          </div>

          <p style="color: #64748b; font-size: 14px;">Votre facture et les détails de votre souscription sont joints à cet email en format PDF.</p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Bamousso RH. Abidjan, Côte d'Ivoire.</p>
        </div>
      `,
    });

    return { success: !error, data, error };
  } catch (err) {
    console.error('Error sending subscription email:', err);
    return { success: false, error: err };
  }
};

export const sendAdminSubscriptionNotification = async (companyName: string, plan: string, amount: number, pdfBuffer?: Buffer) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Bamousso RH <alerts@resend.dev>',
      to: 'phanojeje@gmail.com', // Email de l'admin (le vôtre)
      subject: `Nouveau Client : ${companyName} (${plan})`,
      attachments: pdfBuffer ? [{ filename: `Abonnement_${companyName}.pdf`, content: pdfBuffer }] : [],
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Nouvelle Souscription Détectée !</h2>
          <p>Le client <strong>${companyName}</strong> vient de s'abonner.</p>
          <ul>
            <li><strong>Plan :</strong> ${plan}</li>
            <li><strong>Montant :</strong> ${amount.toLocaleString()} FCFA</li>
            <li><strong>Date :</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
          <p>Le compte a été activé automatiquement pour 1 an.</p>
        </div>
      `,
    });

    return { success: !error, data, error };
  } catch (err) {
    console.error('Error sending admin notification:', err);
    return { success: false, error: err };
  }
};
