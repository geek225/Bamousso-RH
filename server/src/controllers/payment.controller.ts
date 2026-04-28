import { Request, Response } from 'express';
import axios from 'axios';
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

    // Identifiants GeniusPay (à configurer dans les variables d'environnement)
    const apiKey = process.env.GENIUSPAY_KEY;
    const apiSecret = process.env.GENIUSPAY_SECRET;

    if (!apiKey || !apiSecret) {
      console.error("Clés GeniusPay manquantes dans .env");
      return res.status(500).json({ success: false, message: "Configuration de paiement incomplète sur le serveur." });
    }

    // Appel à l'API GeniusPay pour créer une transaction
    const response = await axios.post('https://pay.genius.ci/api/v1/merchant/payments', {
      amount: parseInt(amount),
      description: description || "Abonnement Bamousso RH",
      currency: "XOF",
      metadata: {
        companyId: companyId,
        plan: plan
      },
      // URLs de retour (noms exacts de la doc)
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

/**
 * Webhook pour confirmer le paiement
 */
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const { event, data } = req.body;

    // TODO: Vérifier la signature pour la sécurité si GeniusPay le supporte

    if (event === 'payment.success' || data.status === 'completed' || data.status === 'SUCCESS') {
      const companyId = data.metadata?.companyId;
      const plan = data.metadata?.plan;

      if (companyId) {
        // Mettre à jour l'entreprise
        await prisma.company.update({
          where: { id: companyId },
          data: {
            subscriptionStatus: "ACTIVE",
            isActive: true,
            isLocked: false,
            subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 jours
          }
        });
        console.log(`Paiement réussi pour l'entreprise ${companyId}`);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).send('Webhook Error');
  }
};
