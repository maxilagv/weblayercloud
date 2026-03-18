'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore } = require('firebase-admin/firestore');
const nodemailer = require('nodemailer');

/**
 * Envía el email de bienvenida al tenant recién registrado.
 * Se llama desde onTenantRegistration después de crear el tenant.
 *
 * Requiere las variables de entorno (Firebase Functions config):
 *   SMTP_USER  — cuenta Gmail o SMTP (ej: contacto@weblayer.cloud)
 *   SMTP_PASS  — contraseña de aplicación (Gmail App Password)
 *
 * Para configurar en producción:
 *   firebase functions:secrets:set SMTP_USER
 *   firebase functions:secrets:set SMTP_PASS
 */
module.exports = onCall(
  {
    secrets: ['SMTP_USER', 'SMTP_PASS'],
  },
  async (request) => {
    // Solo llamable internamente (desde onTenantRegistration) o por super admin
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Requiere autenticación');
    }

    const { tenantId } = request.data;
    if (!tenantId) throw new HttpsError('invalid-argument', 'Requerido: tenantId');

    const db       = getFirestore();
    const snap     = await db.collection('tenants').doc(tenantId).get();
    if (!snap.exists) throw new HttpsError('not-found', 'Tenant no encontrado');

    const tenant   = snap.data();
    const trialEnd = tenant.trialEndsAt.toDate().toLocaleDateString('es-AR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    const storeUrl = `https://weblayer.cloud/demo/${tenantId}`;
    const adminUrl = `https://weblayer.cloud/demo/${tenantId}/admin`;
    const dashUrl  = `https://weblayer.cloud/dashboard`;

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpUser, pass: smtpPass },
    });

    const firstName = tenant.ownerName?.split(' ')[0] ?? 'hola';

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: #F4F4F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrap { max-width: 560px; margin: 40px auto; background: #fff; border-top: 4px solid #FF3B00; }
    .header { padding: 32px 40px 0; }
    .brand { font-size: 18px; font-weight: 900; letter-spacing: -0.04em; color: #0A0A0A; }
    .brand span { color: #FF3B00; }
    .body { padding: 28px 40px 36px; }
    h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.03em; color: #0A0A0A; margin: 0 0 12px; line-height: 1.2; }
    p { font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 20px; }
    .links { background: #F9F9F9; border: 1px solid #E5E5E5; padding: 20px 24px; margin: 24px 0; }
    .link-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .link-row:last-child { margin-bottom: 0; }
    .link-label { font-size: 11px; font-family: monospace; letter-spacing: 0.1em; text-transform: uppercase; color: #999; min-width: 90px; }
    .link-url { font-size: 13px; color: #FF3B00; text-decoration: none; word-break: break-all; }
    .cta { display: inline-block; background: #FF3B00; color: #fff !important; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 28px; margin: 8px 0; }
    .footer { padding: 20px 40px; border-top: 1px solid #E5E5E5; font-size: 12px; color: #aaa; }
    .trial-end { font-size: 13px; color: #888; margin: 0 0 28px; }
    .trial-end strong { color: #0A0A0A; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="brand">Layer<span>Cloud</span></div>
    </div>
    <div class="body">
      <h1>Tu demo de ${tenant.businessName} está lista, ${firstName} 🚀</h1>
      <p>Configuramos todo para que puedas explorar el sistema sin limitaciones durante 7 días.</p>

      <p class="trial-end">La prueba vence el <strong>${trialEnd}</strong>.</p>

      <div class="links">
        <div class="link-row">
          <span class="link-label">🛍 Tienda</span>
          <a href="${storeUrl}" class="link-url">${storeUrl}</a>
        </div>
        <div class="link-row">
          <span class="link-label">⚙ Admin</span>
          <a href="${adminUrl}" class="link-url">${adminUrl}</a>
        </div>
        <div class="link-row">
          <span class="link-label">📊 Dashboard</span>
          <a href="${dashUrl}" class="link-url">${dashUrl}</a>
        </div>
      </div>

      <a href="${storeUrl}" class="cta">Ver mi tienda →</a>

      <p style="margin-top:28px;font-size:14px;color:#888;">
        ¿Querés activar el sistema completo o tenés preguntas?<br>
        Escribinos a <a href="mailto:contacto@weblayer.cloud" style="color:#FF3B00;">contacto@weblayer.cloud</a>
      </p>
    </div>
    <div class="footer">
      LayerCloud · weblayer.cloud · Este email fue enviado a ${tenant.ownerEmail}
    </div>
  </div>
</body>
</html>`;

    try {
      await transporter.sendMail({
        from:    `"LayerCloud" <${smtpUser}>`,
        to:      tenant.ownerEmail,
        subject: `Tu demo de ${tenant.businessName} está lista 🚀`,
        html,
      });
      return { success: true };
    } catch (err) {
      console.error('[sendWelcomeEmail] Error:', err);
      // Silencioso — no bloquea el registro
      return { success: false, error: String(err) };
    }
  }
);
