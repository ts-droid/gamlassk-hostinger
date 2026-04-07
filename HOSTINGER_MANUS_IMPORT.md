# Hostinger Manus Import

Använd den här importen när Hostinger-databasen `u424280856_gamla_ssk` ska fyllas med data från Manus-exporterna.

## Filer

- Full import SQL: `imports/hostinger/full_manus_import.sql`
- Användarimport separat: `imports/hostinger/users_20260406_192204.sql`
- Lokala dokumentfiler:
  - `client/public/documents/gamla-ssk-stadgar.pdf`
  - `client/public/documents/protokoll-gamla-sodertalje-sk-nov-13-2025.pdf`

## Vad som importeras

- `users`
- `roles`
- `news`
- `site_settings`
- `page_content`
- `events`
- `documents`
- samt tomma men korrekta tabeller för:
  - `gallery_photos`
  - `board_members`
  - `membership_applications`
  - `payment_confirmations`
  - `event_registrations`
  - `content_history`

## Viktiga justeringar

- `site_logo` importeras som lokal filväg `/logo-wreath.png`
- `site_header_logo` läggs till med värdet `/logo-wreath.png`
- dokumentlänkar skrivs om till:
  - `/documents/gamla-ssk-stadgar.pdf`
  - `/documents/protokoll-gamla-sodertalje-sk-nov-13-2025.pdf`

## Körning i Hostinger

1. Klicka på databasen `u424280856_gamla_ssk` i phpMyAdmin.
2. Ta gärna en export/backup först.
3. Importera `imports/hostinger/full_manus_import.sql`.
4. Redeploya eller starta om appen i Hostinger.
5. Verifiera att `users`, `page_content`, `site_settings`, `news`, `events` och `documents` finns.

## Efter import

- Testa inloggning med `OWNER_EMAIL`.
- Öppna `/documents` och kontrollera att båda PDF:erna öppnas.
- Kontrollera startsidan så att CMS-innehåll och logotyp laddas från databasen.
