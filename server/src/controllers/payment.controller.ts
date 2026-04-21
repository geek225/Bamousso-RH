import { Request, Response } from "express";
import prisma from "../utils/prisma.js";
import paydunya from 'paydunya';

/**
 * Initialise un paiement et récupère l'URL de redirection Paydunya.
 */
export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { amount, description, companyId } = req.body;

    if (!amount || !companyId) {
      return res.status(400).json({ 
        success: false, 
        message: "Montant et ID entreprise requis." 
      });
    }

    // 1. Configuration Paydunya
    const isTest = process.env.PAYDUNYA_MASTER_KEY?.startsWith('test_') || process.env.PAYDUNYA_PUBLIC_KEY?.startsWith('test_') || true;
    
    const setup = new paydunya.Setup({
      masterKey: process.env.PAYDUNYA_MASTER_KEY,
      privateKey: process.env.PAYDUNYA_PRIVATE_KEY,
      publicKey: process.env.PAYDUNYA_PUBLIC_KEY,
      token: process.env.PAYDUNYA_TOKEN,
      mode: isTest ? 'test' : 'live'
    });

    const store = new paydunya.Store({
      name: 'NexTeam SaaS',
      tagline: 'Solution RH moderne',
      phoneNumber: '22500000000',
      postalAddress: 'Abidjan, Côte d\'Ivoire',
      websiteURL: process.env.FRONTEND_URL,
      logoURL: 'https://nexteam.ci/logo.png',
      cancelURL: `${process.env.FRONTEND_URL}/payment-cancelled`,
      returnURL: `${process.env.FRONTEND_URL}/payment-success`,
      callbackURL: `${process.env.BACKEND_URL}/api/payments/webhook`
    });

    // Génération d'une référence unique
    const reference = `NT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Vérifier si l'entreprise existe, sinon la créer pour le test
    let company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      company = await prisma.company.create({
        data: {
          id: companyId,
          name: "Entreprise Test",
          subscriptionStatus: "PENDING",
        }
      });
    }

    // Créer la transaction en base de données
    await prisma.payment.create({
      data: {
        amount: Number(amount),
        currency: "XOF",
        reference: reference,
        description: description || "Abonnement NexTeam",
        status: "PENDING",
        companyId: companyId,
      },
    });

    // 2. Création de la facture Paydunya
    const invoice = new paydunya.CheckoutInvoice(setup, store);
    invoice.addItem(description || "Abonnement NexTeam", 1, Number(amount), Number(amount));
    invoice.totalAmount = Number(amount);
    invoice.description = description || "Abonnement NexTeam";
    invoice.addCustomData('reference', reference);

    const result = await invoice.create();

    if (invoice.token) {
      return res.status(200).json({ 
        success: true, 
        url: invoice.url, 
        reference: reference 
      });
    } else {
      console.error("Paydunya Error:", invoice.responseText);
      return res.status(400).json({ 
        success: false, 
        message: invoice.responseText || "Erreur Paydunya" 
      });
    }

  } catch (error: any) {
    console.error("Initiate Payment Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Erreur serveur" 
    });
  }
};

/**
 * Simule un succès de paiement pour les tests locaux.
 */
export const simulateSuccess = async (req: Request, res: Response) => {
  const { reference } = req.query;

  console.log(`[Simulation Paydunya] Succès simulé pour la référence: ${reference}`);

  // Simuler l'appel Webhook (IPN Paydunya)
  await handleWebhook({
    body: {
      data: {
        status: "completed",
        invoice: {
          total_amount: 100
        },
        custom_data: {
          reference: reference
        }
      }
    }
  } as any, {
    status: () => ({ json: () => {}, send: () => {} })
  } as any);

  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}/payment-success`);
};

/**
 * Vérifie le statut d'un paiement après redirection (via le token Paydunya).
 */
export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token manquant." });
    }

    const isTest = process.env.PAYDUNYA_MASTER_KEY?.startsWith('test_') || process.env.PAYDUNYA_PUBLIC_KEY?.startsWith('test_');
    const CONFIRM_BASE = isTest ? "https://app.paydunya.com/sandbox-api/v1" : "https://app.paydunya.com/api/v1";
    const CONFIRM_URL = `${CONFIRM_BASE}/checkout-invoice/confirm/${token}`;

    const response = await fetch(CONFIRM_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY || "",
        "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY || "",
        "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN || "",
      },
    });

    const data: any = await response.json();

    if (data.status === "completed" || data.status === "success") {
      const reference = data.custom_data?.reference;

      // Mettre à jour en base de données
      const payment = await prisma.payment.findUnique({
        where: { reference: reference },
      });

      if (payment) {
        await prisma.payment.update({
          where: { reference: reference },
          data: { status: "SUCCESS" },
        });

        await prisma.company.update({
          where: { id: payment.companyId },
          data: {
            subscriptionStatus: "ACTIVE",
            subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        return res.status(200).json({ success: true, message: "Paiement confirmé." });
      }
    }

    return res.status(400).json({ 
      success: false, 
      message: "Le paiement n'a pas pu être confirmé ou n'est pas terminé.",
      status: data.status 
    });

  } catch (error) {
    console.error("Confirm Payment Error:", error);
    return res.status(500).json({ success: false, message: "Erreur lors de la confirmation." });
  }
};

/**
 * Gère les notifications de paiement (IPN) envoyées par Paydunya.
 */
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    // Le format Paydunya IPN peut varier, souvent c'est un POST avec les datas
    const { status, custom_data } = req.body.data || req.body;
    const reference = custom_data?.reference || req.body.reference;

    console.log(`[IPN Paydunya] Paiement reçu: Ref=${reference}, Status=${status}`);

    const payment = await prisma.payment.findUnique({
      where: { reference: reference },
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: "Paiement non trouvé." });
    }

    const isSuccess = status === "completed" || status === "success";

    await prisma.payment.update({
      where: { reference: reference },
      data: {
        status: isSuccess ? "SUCCESS" : "FAILED",
      },
    });

    if (isSuccess) {
      await prisma.company.update({
        where: { id: payment.companyId },
        data: {
          subscriptionStatus: "ACTIVE",
          subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).json({ success: false, message: "Erreur lors du traitement du webhook." });
  }
};

