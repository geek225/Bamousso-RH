import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import prisma from '../utils/prisma.js';

/**
 * Initialise un paiement avec GeniusPay
 */
export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { amount, description, companyId, plan } = req.body;

    if (!amount || !companyId) {
      return res.status(400).json({ success: false, message: "Montant et ID entreprise requis." });
    }

    const apiKey = process.env.GENIUSPAY_KEY;
    const apiSecret = process.env.GENIUSPAY_SECRET;

    if (!apiKey || !apiSecret) {
      console.error("Clés GeniusPay manquantes dans .env");
      return res.status(500).json({ success: false, message: "Configuration de paiement incomplète sur le serveur." });
    }

    const response = await axios.post('https://pay.genius.ci/api/v1/merchant/payments', {
      amount: parseInt(amount),
      description: description || "Abonnement Bamousso RH",
      currency: "XOF",
      metadata: {
        companyId: companyId,
        plan: plan,
        extraEmployees: req.body.extraEmployees || 0
      },
      success_url: `${process.env.FRONTEND_URL}/payment-success?companyId=${companyId}`,
      error_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
    }, {
      headers: {
        'X-API-Key': apiKey,
        'X-API-Secret': apiSecret,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.data && response.data.data.checkout_url) {
      const transactionId = response.data.data.transaction_id;

      // Sauvegarde de la transaction en attente dans la DB
      await prisma.payment.create({
        data: {
          amount: parseFloat(amount),
          reference: `BAM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          externalId: transactionId,
          status: "PENDING",
          companyId: companyId,
          description: description || `Abonnement Bamousso - ${plan}`,
        }
      });

      return res.json({
        success: true,
        url: response.data.data.checkout_url,
        transactionId: transactionId
      });
    }

    throw new Error(response.data.message || "Réponse invalide de GeniusPay");

  } catch (error: any) {
    console.error("GeniusPay Initiation Error:", error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de l'initialisation du paiement.",
      error: error.response?.data || error.message 
    });
  }
};

import { sendSubscriptionConfirmation, sendAdminSubscriptionNotification } from '../utils/mailer.js';
import { generateSubscriptionPDF } from '../utils/pdfGenerator.js';

/**
 * Webhook pour confirmer le paiement avec vérification de signature
 */
export const handleWebhook = async (req: Request, res: Response) => {
  console.log("--- GENIUSPAY WEBHOOK RECEIVED ---");
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));

  try {
    const signature = req.headers['x-webhook-signature'] as string;
    const timestamp = req.headers['x-webhook-timestamp'] as string;
    const webhookSecret = process.env.GENIUSPAY_WEBHOOK_SECRET;

    // --- DEBUG: Temporarily disabled signature verification ---
    if (webhookSecret && signature && timestamp) {
      const payload = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(`${timestamp}.${payload}`)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error("Signature Webhook invalide !");
        return res.status(401).send('Invalid signature');
      }
    }

    const { event, data } = req.body;

    if (event === 'payment.success' || data.status === 'completed' || data.status === 'SUCCESS') {
      const companyId = data.metadata?.companyId;
      const extraEmployees = parseInt(data.metadata?.extraEmployees || '0');

      if (companyId) {
        // 1. Mettre à jour l'entreprise
        const company = await (prisma.company.update({
          where: { id: companyId },
          data: {
            subscriptionStatus: "ACTIVE",
            isActive: true,
            isLocked: false,
            extraEmployees: extraEmployees,
            subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 jours
          } as any,
          include: { users: { where: { role: 'COMPANY_ADMIN' }, take: 1 } }
        }) as any);

        // 2. Mettre à jour le record de paiement
        await prisma.payment.updateMany({
          where: { externalId: data.transaction_id || data.id },
          data: { status: "SUCCESS" }
        });

        const adminEmail = company.users[0]?.email;
        const amount = data.amount || 0;

        // Génération du PDF
        const pdfBuffer = await generateSubscriptionPDF({
          companyName: company.name,
          plan: company.plan,
          amount: amount,
          date: new Date().toLocaleDateString(),
          transactionId: data.transaction_id || 'GP-' + Date.now()
        });

        // Envoi des emails
        if (adminEmail) {
          await sendSubscriptionConfirmation(adminEmail, company.name, company.plan, amount, pdfBuffer);
        }
        await sendAdminSubscriptionNotification(company.name, company.plan, amount, pdfBuffer);

        console.log(`Paiement confirmé et emails envoyés pour ${company.name}`);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).send('Webhook Error');
  }
};

/**
 * Vérifie l'état d'un paiement (appelé par le frontend après redirection)
 */
export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { token } = req.params; // Le token est l'externalId (transaction_id)

    if (!token) {
      return res.status(400).json({ success: false, message: "Token requis." });
    }

    // On cherche le paiement dans notre DB
    const payment = await prisma.payment.findFirst({
      where: { externalId: token as string },
      include: { company: true }
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: "Paiement introuvable." });
    }

    // Si le webhook a déjà fonctionné, le statut est SUCCESS
    if (payment.status === "SUCCESS") {
      return res.json({ success: true, status: "SUCCESS" });
    }

    // Sinon, on peut tenter une vérification directe auprès de GeniusPay (Optionnel mais recommandé)
    // Pour l'instant, on se base sur notre DB qui sera mise à jour par le webhook.
    // Si le statut est toujours PENDING, on renvoie false pour que le client réessaie ou attende.
    
    return res.json({ 
      success: payment.status === "SUCCESS", 
      status: payment.status 
    });

  } catch (error: any) {
    console.error("Confirm Payment Error:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la confirmation." });
  }
};
