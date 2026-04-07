const DEFAULT_REGISTRATION_NOTICE = `
  <p>Anmälan till <strong>{{title}}</strong> registreras direkt i systemet.</p>
  <p>{{paymentNotice}}</p>
  <p>Har du frågor kan du skriva dem i meddelanderutan innan du bekräftar din anmälan.</p>
`;

type EventRegistrationDetails = {
  title?: string | null;
  feeAmount?: string | null;
  paymentInstructions?: string | null;
  registrationNotice?: string | null;
  location?: string | null;
  eventDate?: string | Date | null;
};

function formatEventDate(value: string | Date | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getEventRegistrationNoticeTemplate(template?: string | null) {
  return template?.trim() ? template : DEFAULT_REGISTRATION_NOTICE;
}

export function renderEventRegistrationNotice(
  template: string | null | undefined,
  event: EventRegistrationDetails,
) {
  const paymentNotice = event.feeAmount
    ? `Anmälan är bindande först efter inbetald summa <strong>${event.feeAmount}</strong>${event.paymentInstructions ? `. Betalning via ${event.paymentInstructions}.` : "."}`
    : event.paymentInstructions
      ? `Betalning och vidare instruktioner: ${event.paymentInstructions}.`
      : "Ingen särskild betalningsinformation är angiven för detta event ännu.";

  const replacements: Record<string, string> = {
    "{{title}}": event.title ?? "",
    "{{feeAmount}}": event.feeAmount ?? "",
    "{{paymentInstructions}}": event.paymentInstructions ?? "",
    "{{location}}": event.location ?? "",
    "{{eventDate}}": formatEventDate(event.eventDate),
    "{{paymentNotice}}": paymentNotice,
  };

  return Object.entries(replacements).reduce(
    (content, [token, value]) => content.split(token).join(value),
    getEventRegistrationNoticeTemplate(event.registrationNotice || template),
  );
}
