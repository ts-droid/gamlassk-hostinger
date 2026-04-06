import { Resend } from 'resend';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Default sender email (will be overridden if user configures custom domain)
const DEFAULT_FROM_EMAIL = 'onboarding@resend.dev';

/**
 * Check if email service is configured
 */
export function isEmailServiceConfigured(): boolean {
  return resend !== null && !!process.env.RESEND_API_KEY;
}

/**
 * Get the sender email address
 * Uses custom domain if configured, otherwise falls back to Resend default
 */
function getSenderEmail(): string {
  // Check if user has configured a custom sender email
  const customEmail = process.env.EMAIL_FROM;
  if (customEmail) {
    return customEmail;
  }
  
  // Fall back to Resend default (only works in development)
  return DEFAULT_FROM_EMAIL;
}

/**
 * Generic email sending function
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.error('[Email] Resend not configured - RESEND_API_KEY missing');
    return { 
      success: false, 
      error: 'Email service not configured' 
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: options.from || getSenderEmail(),
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('[Email] Failed to send email:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Email sent successfully:', data?.id);
    return { success: true };
  } catch (error) {
    console.error('[Email] Exception while sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  userName?: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.error('[Email] Resend not configured - RESEND_API_KEY missing');
    return { 
      success: false, 
      error: 'Email service not configured' 
    };
  }

  try {
    const resetUrl = `${process.env.VITE_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const fromEmail = getSenderEmail();
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: 'Återställ ditt lösenord - Gamla SSK-are',
      html: generatePasswordResetEmailHTML(resetUrl, userName),
    });

    if (error) {
      console.error('[Email] Failed to send password reset email:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send email' 
      };
    }

    console.log('[Email] Password reset email sent successfully:', data?.id);
    return { success: true };
  } catch (error) {
    console.error('[Email] Error sending password reset email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Send welcome email to new members
 */
export async function sendWelcomeEmail(
  to: string,
  userName: string,
  membershipNumber: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.error('[Email] Resend not configured - RESEND_API_KEY missing');
    return { 
      success: false, 
      error: 'Email service not configured' 
    };
  }

  try {
    const fromEmail = getSenderEmail();
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: 'Välkommen till Föreningen Gamla SSK-are!',
      html: generateWelcomeEmailHTML(userName, membershipNumber),
    });

    if (error) {
      console.error('[Email] Failed to send welcome email:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send email' 
      };
    }

    console.log('[Email] Welcome email sent successfully:', data?.id);
    return { success: true };
  } catch (error) {
    console.error('[Email] Error sending welcome email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Generate HTML for password reset email
 */
function generatePasswordResetEmailHTML(resetUrl: string, userName?: string): string {
  const greeting = userName ? `Hej ${userName}` : 'Hej';
  
  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Återställ ditt lösenord</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #003366; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Föreningen Gamla SSK-are</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #003366; margin-top: 0; font-size: 20px;">${greeting},</h2>
              
              <p style="color: #333333; line-height: 1.6; margin: 20px 0;">
                Vi har fått en begäran om att återställa lösenordet för ditt konto hos Föreningen Gamla SSK-are.
              </p>
              
              <p style="color: #333333; line-height: 1.6; margin: 20px 0;">
                Klicka på knappen nedan för att välja ett nytt lösenord:
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; background-color: #E8A317; color: #003366; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
                      Återställ lösenord
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #666666; line-height: 1.6; margin: 20px 0; font-size: 14px;">
                Om knappen inte fungerar kan du kopiera och klistra in denna länk i din webbläsare:
              </p>
              
              <p style="color: #0066cc; line-height: 1.6; margin: 10px 0; font-size: 14px; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <p style="color: #999999; line-height: 1.6; margin: 30px 0 0 0; font-size: 13px; border-top: 1px solid #eeeeee; padding-top: 20px;">
                <strong>Observera:</strong> Denna länk är giltig i 24 timmar. Om du inte begärde en lösenordsåterställning kan du ignorera detta meddelande.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #999999; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} Föreningen Gamla SSK-are<br>
                Sveriges äldsta stödförening - Sedan 1937
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate HTML for welcome email
 */
function generateWelcomeEmailHTML(userName: string, membershipNumber: string): string {
  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Välkommen till Gamla SSK-are</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #003366; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Välkommen till Gamla SSK-are!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #003366; margin-top: 0; font-size: 20px;">Hej ${userName}!</h2>
              
              <p style="color: #333333; line-height: 1.6; margin: 20px 0;">
                Välkommen som medlem i Föreningen Gamla SSK-are - Sveriges äldsta stödförening för Södertälje SK!
              </p>
              
              <p style="color: #333333; line-height: 1.6; margin: 20px 0;">
                Ditt medlemsnummer är: <strong style="color: #E8A317; font-size: 18px;">${membershipNumber}</strong>
              </p>
              
              <p style="color: #333333; line-height: 1.6; margin: 20px 0;">
                Som medlem får du:
              </p>
              
              <ul style="color: #333333; line-height: 1.8; margin: 20px 0; padding-left: 20px;">
                <li>Tillgång till medlemssidor och dokument</li>
                <li>Information om kommande evenemang</li>
                <li>Möjlighet att delta i föreningens aktiviteter</li>
                <li>Stöd SSK genom din årsavgift</li>
              </ul>
              
              <p style="color: #333333; line-height: 1.6; margin: 20px 0;">
                Vi ser fram emot att ha dig med oss!
              </p>
              
              <p style="color: #333333; line-height: 1.6; margin: 30px 0 10px 0;">
                Med vänliga hälsningar,<br>
                <strong>Styrelsen för Föreningen Gamla SSK-are</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #999999; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} Föreningen Gamla SSK-are<br>
                Sveriges äldsta stödförening - Sedan 1937
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
