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
      return res.json({
        success: true,
        url: response.data.data.checkout_url,
        transactionId: response.data.data.transaction_id
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
  try {
    const signature = req.headers['x-webhook-signature'] as string;
    const timestamp = req.headers['x-webhook-timestamp'] as string;
    const webhookSecret = process.env.GENIUSPAY_WEBHOOK_SECRET;

    // Vérification de la signature si le secret est configuré
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
        const company = await (prisma.company.update({
          where: { id: companyId },
          data: {
            subscriptionStatus: "ACTIVE",
            isActive: true,
            isLocked: false,
            extraEmployees: extraEmployees,
            subscriptionEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // +1 an
          },
          include: { users: { where: { role: 'COMPANY_ADMIN' }, take: 1 } }
        }) as any);

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
