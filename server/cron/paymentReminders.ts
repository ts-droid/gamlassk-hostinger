/**
 * Cron job for sending automatic payment reminders to members
 * Runs daily and sends reminders to members whose membership expires in 30 days
 */

import { getDb } from '../db';
import { users } from '../../drizzle/schema';
import { sql } from 'drizzle-orm';
import { sendEmail } from '../emailService';

export async function sendPaymentReminders() {
  console.log('[Cron] Starting payment reminder job...');
  
  try {
    const db = await getDb();
    if (!db) {
      console.error('[Cron] Database not available');
      return;
    }

    // Find users whose membership payment year is current year and status is unpaid
    // This will remind users who haven't paid for the current year
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12
    
    // Only send reminders in November-December for next year's membership
    if (currentMonth < 11) {
      console.log('[Cron] Not reminder season yet (only Nov-Dec), skipping');
      return;
    }
    
    // Query users with unpaid membership for next year
    const nextYear = currentYear + 1;
    const expiringUsers = await db
      .select()
      .from(users)
      .where(
        sql`${users.paymentStatus} = 'unpaid' AND (${users.paymentYear} < ${nextYear} OR ${users.paymentYear} IS NULL)`
      );

    console.log(`[Cron] Found ${expiringUsers.length} users with expiring membership`);

    // Send reminder emails
    let successCount = 0;
    let failureCount = 0;

    for (const user of expiringUsers) {
      if (!user.email) {
        console.warn(`[Cron] User ${user.id} has no email, skipping`);
        continue;
      }

      try {
        await sendEmail({
          to: user.email,
          subject: 'Påminnelse: Din medlemsavgift går snart ut',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #001f3f 0%, #0066a6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; background: #d4a017; color: #001f3f; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Föreningen Gamla SSK-are</h1>
                  <p>Sveriges äldsta stödförening</p>
                </div>
                <div class="content">
                  <h2>Hej ${user.name || 'medlem'}!</h2>
                  
                  <p>Det är dags att förnya ditt medlemskap i Föreningen Gamla SSK-are för år <strong>${nextYear}</strong>.</p>
                  
                  <p>För att fortsätta vara medlem och stödja Södertälje SK, förnya ditt medlemskap genom att betala årsavgiften på <strong>150 kr</strong>.</p>
                  
                  <div style="text-align: center;">
                    <a href="${process.env.VITE_APP_URL || 'https://gamlassk.se'}/payment" class="button">
                      Betala medlemsavgift
                    </a>
                  </div>
                  
                  <h3>Betalningsinformation:</h3>
                  <ul>
                    <li><strong>Belopp:</strong> 150 kr/år</li>
                    <li><strong>Swish:</strong> Se på betalningssidan</li>
                    <li><strong>Bankgiro:</strong> Se på betalningssidan</li>
                  </ul>
                  
                  <p>Efter betalning, ladda upp ditt kvitto på vår webbplats så verifierar vi din betalning inom 1-2 arbetsdagar.</p>
                  
                  <p>Tack för ditt stöd till SSK!</p>
                  
                  <p>Med vänliga hälsningar,<br>
                  <strong>Styrelsen för Föreningen Gamla SSK-are</strong></p>
                </div>
                <div class="footer">
                  <p>Detta är en automatisk påminnelse. Svara inte på detta e-postmeddelande.</p>
                  <p>Föreningen Gamla SSK-are | Grundad 1937</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        successCount++;
        console.log(`[Cron] Sent reminder to ${user.email}`);
      } catch (error) {
        failureCount++;
        console.error(`[Cron] Failed to send reminder to ${user.email}:`, error);
      }
    }

    console.log(`[Cron] Payment reminder job completed. Success: ${successCount}, Failures: ${failureCount}`);
  } catch (error) {
    console.error('[Cron] Payment reminder job failed:', error);
  }
}

// To run manually for testing:
// node --loader ts-node/esm server/cron/paymentReminders.ts
