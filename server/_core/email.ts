import { ENV } from './env';

interface SendEventInvitationParams {
  to: string;
  recipientName: string;
  eventTitle: string;
  eventDate: Date;
  eventLocation?: string;
  eventDescription?: string;
  rsvpUrl: string;
}

/**
 * Send event invitation email using Resend API
 */
export async function sendEventInvitation(params: SendEventInvitationParams): Promise<boolean> {
  if (!ENV.resendApiKey) {
    console.warn('[Email] Resend API key not configured, skipping email send');
    return false;
  }

  const { to, recipientName, eventTitle, eventDate, eventLocation, eventDescription, rsvpUrl } = params;

  const formattedDate = new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(eventDate);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inbjudan till ${eventTitle}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #003366 0%, #0066cc 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">Inbjudan till evenemang</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hej ${recipientName},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">Du är inbjuden till följande evenemang:</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0066cc;">
      <h2 style="margin: 0 0 15px 0; color: #003366; font-size: 20px;">${eventTitle}</h2>
      
      <p style="margin: 10px 0; font-size: 15px;">
        <strong>📅 Datum:</strong> ${formattedDate}
      </p>
      
      ${eventLocation ? `
      <p style="margin: 10px 0; font-size: 15px;">
        <strong>📍 Plats:</strong> ${eventLocation}
      </p>
      ` : ''}
      
      ${eventDescription ? `
      <p style="margin: 15px 0 0 0; font-size: 15px; color: #666;">
        ${eventDescription}
      </p>
      ` : ''}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${rsvpUrl}" style="display: inline-block; background: #0066cc; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
        Anmäl dig här
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
      Med vänliga hälsningar,<br>
      <strong>Föreningen Gamla SSK-are</strong>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
    <p>Detta är ett automatiskt meddelande från Föreningen Gamla SSK-are.</p>
  </div>
</body>
</html>
  `;

  const textContent = `
Hej ${recipientName},

Du är inbjuden till följande evenemang:

${eventTitle}
Datum: ${formattedDate}
${eventLocation ? `Plats: ${eventLocation}` : ''}

${eventDescription || ''}

Anmäl dig här: ${rsvpUrl}

Med vänliga hälsningar,
Föreningen Gamla SSK-are
  `.trim();

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ENV.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Föreningen Gamla SSK-are <noreply@notifications.manus.im>',
        to: [to],
        subject: `Inbjudan: ${eventTitle}`,
        html: htmlContent,
        text: textContent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Email] Failed to send invitation:', error);
      return false;
    }

    const result = await response.json();
    console.log('[Email] Invitation sent successfully:', result);
    return true;
  } catch (error) {
    console.error('[Email] Error sending invitation:', error);
    return false;
  }
}
