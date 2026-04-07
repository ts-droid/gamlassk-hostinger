import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { GripVertical, Plus, Pencil, Trash2, Eye, EyeOff, Monitor } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RichTextEditor } from "@/components/RichTextEditor";
import { VersionHistory } from "@/components/admin/VersionHistory";

interface PageEditorProps {
  page: string;
}

interface ContentSection {
  id: number;
  page: string;
  sectionKey: string;
  type: string;
  content: string | null;
  order: number;
  published: number;
}

const PAGE_SECTION_TEMPLATES: Record<
  string,
  Array<{
    sectionKey: string;
    type: string;
    content: string;
    label: string;
    description: string;
  }>
> = {
  site: [
    {
      sectionKey: "footer_social_title",
      type: "text",
      content: "SSK i sociala medier",
      label: "Footer: social rubrik",
      description: "Rubriken för sociala medier i footern.",
    },
    {
      sectionKey: "footer_social_links",
      type: "html",
      content: "<p>Facebook</p><p>Instagram</p><p>X</p><p>YouTube</p>",
      label: "Footer: sociala länkar",
      description: "Raderna under sociala medier i footern.",
    },
    {
      sectionKey: "footer_contact_title",
      type: "text",
      content: "Kontakt",
      label: "Footer: kontaktrubrik",
      description: "Rubriken för kontaktkolumnen i footern.",
    },
    {
      sectionKey: "footer_contact_lines",
      type: "html",
      content: "<p>Föreningen Gamla SSK-are</p><p>Stöd, historia och gemenskap</p><p>Södertälje</p>",
      label: "Footer: kontaktrader",
      description: "Kontaktinformationen i footern.",
    },
    {
      sectionKey: "footer_links_title",
      type: "text",
      content: "Snabblänkar",
      label: "Footer: länkrubrik",
      description: "Rubriken för snabblänkar i footern.",
    },
    {
      sectionKey: "footer_bottom_text",
      type: "text",
      content: "Powered by Gamla SSK",
      label: "Footer: nedertext",
      description: "Den nedersta raden under loggan i footern.",
    },
  ],
  home: [
    {
      sectionKey: "news_section_title",
      type: "text",
      content: "Senaste nyheterna",
      label: "Nyhetsrubrik",
      description: "Rubriken ovanför nyhetskorten på startsidan.",
    },
    {
      sectionKey: "news_section_description",
      type: "text",
      content: "Här hittar du de senaste uppdateringarna, nyheterna och händelserna från föreningen.",
      label: "Nyhetsbeskrivning",
      description: "Ingressen under nyhetsrubriken på startsidan.",
    },
  ],
  statutes: [
    {
      sectionKey: "hero_title",
      type: "text",
      content: "Stadgar och information",
      label: "Hero-rubrik",
      description: "Sidans huvudrubrik överst.",
    },
    {
      sectionKey: "hero_description",
      type: "text",
      content: "Föreningens bakgrund, verksamhet och aktuella stadgar samlade på ett ställe.",
      label: "Hero-beskrivning",
      description: "Ingressen under huvudrubriken.",
    },
    {
      sectionKey: "intro_title",
      type: "text",
      content: "Om Föreningen Gamla SSK-are",
      label: "Intro-rubrik",
      description: "Rubriken för inledningsdelen på sidan.",
    },
  ],
  documents: [
    {
      sectionKey: "hero_title",
      type: "text",
      content: "Dokumentbibliotek",
      label: "Hero-rubrik",
      description: "Sidans huvudrubrik överst.",
    },
    {
      sectionKey: "hero_description",
      type: "text",
      content: "Hitta stadgar, protokoll och andra viktiga dokument på samma plats.",
      label: "Hero-beskrivning",
      description: "Ingressen under huvudrubriken.",
    },
    {
      sectionKey: "loading_text",
      type: "text",
      content: "Laddar dokument...",
      label: "Laddningstext",
      description: "Texten som visas medan dokumenten hämtas.",
    },
    {
      sectionKey: "login_notice_title",
      type: "text",
      content: "Logga in för att se alla dokument",
      label: "Inloggningsruta: rubrik",
      description: "Rubriken i informationsrutan för oinloggade besökare.",
    },
    {
      sectionKey: "login_notice_description",
      type: "text",
      content: "Vissa dokument är endast tillgängliga för medlemmar.",
      label: "Inloggningsruta: beskrivning",
      description: "Beskrivningen i informationsrutan för oinloggade besökare.",
    },
    {
      sectionKey: "login_button_label",
      type: "text",
      content: "Logga in",
      label: "Inloggningsruta: knapptext",
      description: "Texten på inloggningsknappen.",
    },
    {
      sectionKey: "all_tab_label",
      type: "text",
      content: "Alla dokument",
      label: "Alla-flik: etikett",
      description: "Texten på fliken som visar alla dokument.",
    },
    {
      sectionKey: "empty_state_title",
      type: "text",
      content: "Inga dokument tillgängliga.",
      label: "Tomläge: alla dokument",
      description: "Texten som visas när inga dokument finns alls.",
    },
    {
      sectionKey: "empty_category_title",
      type: "text",
      content: "Inga dokument i denna kategori.",
      label: "Tomläge: kategori",
      description: "Texten som visas när vald kategori är tom.",
    },
    {
      sectionKey: "file_size_label",
      type: "text",
      content: "Storlek",
      label: "Filstorlek: etikett",
      description: "Etiketten framför filstorleken i dokumentlistan.",
    },
    {
      sectionKey: "uploaded_label",
      type: "text",
      content: "Uppladdad",
      label: "Uppladdad: etikett",
      description: "Etiketten framför uppladdningsdatumet i dokumentlistan.",
    },
    {
      sectionKey: "view_button_label",
      type: "text",
      content: "Visa",
      label: "Visa-knapp",
      description: "Texten på knappen för att öppna ett dokument.",
    },
    {
      sectionKey: "download_button_label",
      type: "text",
      content: "Ladda ner",
      label: "Ladda ner-knapp",
      description: "Texten på knappen för att ladda ner ett dokument.",
    },
  ],
  calendar: [
    {
      sectionKey: "hero_title",
      type: "text",
      content: "Evenemangskalender",
      label: "Hero-rubrik",
      description: "Sidans huvudrubrik överst.",
    },
    {
      sectionKey: "hero_description",
      type: "text",
      content: "Se alla kommande evenemang, prenumerera på kalendern och anmäl dig direkt.",
      label: "Hero-beskrivning",
      description: "Ingressen under huvudrubriken.",
    },
    {
      sectionKey: "subscription_title",
      type: "text",
      content: "Prenumerera på kalendern",
      label: "Prenumerationsrubrik",
      description: "Rubriken ovanför iCal-prenumerationen.",
    },
    {
      sectionKey: "subscription_description",
      type: "text",
      content: "Lägg till alla evenemang i din egen kalender och få automatiska uppdateringar",
      label: "Prenumerationsbeskrivning",
      description: "Beskrivningen för kalenderprenumerationen.",
    },
    {
      sectionKey: "download_feed_label",
      type: "text",
      content: "Ladda ner iCal-feed",
      label: "Prenumeration: ladda ner-knapp",
      description: "Texten på knappen för att ladda ner iCal-flödet.",
    },
    {
      sectionKey: "copy_feed_label",
      type: "text",
      content: "Kopiera prenumerationslänk",
      label: "Prenumeration: kopiera-knapp",
      description: "Texten på knappen för att kopiera prenumerationslänken.",
    },
    {
      sectionKey: "copy_feed_success",
      type: "text",
      content: "Prenumerationslänk kopierad!",
      label: "Prenumeration: bekräftelse",
      description: "Toast-texten när prenumerationslänken har kopierats.",
    },
    {
      sectionKey: "loading_text",
      type: "text",
      content: "Laddar kalender...",
      label: "Laddningstext",
      description: "Texten som visas medan kalendern laddas.",
    },
    {
      sectionKey: "event_add_to_calendar_title",
      type: "text",
      content: "Lägg till i kalender",
      label: "Eventdialog: kalendersektion",
      description: "Rubriken ovanför knapparna för att lägga till ett event i kalendern.",
    },
    {
      sectionKey: "google_calendar_label",
      type: "text",
      content: "Google Calendar",
      label: "Eventdialog: Google-knapp",
      description: "Texten på knappen för Google Calendar.",
    },
    {
      sectionKey: "download_ics_label",
      type: "text",
      content: "Ladda ner (.ics)",
      label: "Eventdialog: ICS-knapp",
      description: "Texten på knappen för att ladda ner en ICS-fil.",
    },
  ],
  gallery: [
    {
      sectionKey: "hero_title",
      type: "text",
      content: "Bildgalleri",
      label: "Hero-rubrik",
      description: "Sidans huvudrubrik överst.",
    },
    {
      sectionKey: "hero_description",
      type: "text",
      content: "Bilder från föreningens evenemang och aktiviteter. Filtrera på album eller taggar för att hitta rätt snabbare.",
      label: "Hero-beskrivning",
      description: "Ingressen under huvudrubriken.",
    },
    {
      sectionKey: "upload_button_label",
      type: "text",
      content: "Ladda upp bild",
      label: "Uppladdning: öppna-knapp",
      description: "Texten på knappen som öppnar uppladdningsdialogen.",
    },
    {
      sectionKey: "upload_dialog_title",
      type: "text",
      content: "Ladda upp bild",
      label: "Uppladdning: rubrik",
      description: "Rubriken i uppladdningsdialogen.",
    },
    {
      sectionKey: "upload_dialog_description",
      type: "text",
      content: "Placera bilden i ett album och märk upp den med taggar för årtal, platser och personer.",
      label: "Uppladdning: beskrivning",
      description: "Beskrivningen i uppladdningsdialogen.",
    },
    {
      sectionKey: "album_filter_label",
      type: "text",
      content: "Album:",
      label: "Filter: albumetikett",
      description: "Etiketten framför albumfiltret.",
    },
    {
      sectionKey: "album_filter_all_label",
      type: "text",
      content: "Alla album",
      label: "Filter: alla album",
      description: "Texten för standardvalet i albumfiltret.",
    },
    {
      sectionKey: "tag_filter_label",
      type: "text",
      content: "Tagg:",
      label: "Filter: taggetikett",
      description: "Etiketten framför taggfiltret.",
    },
    {
      sectionKey: "tag_filter_all_label",
      type: "text",
      content: "Alla taggar",
      label: "Filter: alla taggar",
      description: "Texten för standardvalet i taggfiltret.",
    },
    {
      sectionKey: "empty_state_title",
      type: "text",
      content: "Inga bilder att visa",
      label: "Tomläge: rubrik",
      description: "Texten som visas när filtret inte ger några bilder.",
    },
    {
      sectionKey: "empty_state_cta",
      type: "text",
      content: "Ladda upp första bilden",
      label: "Tomläge: knapptext",
      description: "Knapptexten när galleriet är tomt för administratörer.",
    },
    {
      sectionKey: "photo_album_prefix",
      type: "text",
      content: "Album",
      label: "Album-prefix",
      description: "Texten framför albumnamnet på bildkorten.",
    },
  ],
  events: [
    {
      sectionKey: "hero_title",
      type: "text",
      content: "Kalender och evenemang",
      label: "Hero-rubrik",
      description: "Sidans huvudrubrik överst.",
    },
    {
      sectionKey: "hero_description",
      type: "text",
      content: "Se våra kommande aktiviteter och anmäl dig direkt här.",
      label: "Hero-beskrivning",
      description: "Ingressen under huvudrubriken.",
    },
    {
      sectionKey: "intro_title",
      type: "text",
      content: "Kommande evenemang",
      label: "Inledningsrubrik",
      description: "Rubriken ovanför eventlistan.",
    },
    {
      sectionKey: "intro_description",
      type: "text",
      content: "Se våra kommande aktiviteter och anmäl dig direkt här!",
      label: "Inledningsbeskrivning",
      description: "Beskrivningen ovanför eventlistan.",
    },
    {
      sectionKey: "fee_label",
      type: "text",
      content: "Avgift",
      label: "Avgiftsetikett",
      description: "Etiketten framför eventavgiften.",
    },
    {
      sectionKey: "payment_label",
      type: "text",
      content: "Betalning",
      label: "Betalningsetikett",
      description: "Etiketten framför betalningsinformationen.",
    },
    {
      sectionKey: "max_participants_prefix",
      type: "text",
      content: "Max",
      label: "Max deltagare: prefix",
      description: "Prefixet framför max antal deltagare.",
    },
    {
      sectionKey: "max_participants_suffix",
      type: "text",
      content: "deltagare",
      label: "Max deltagare: suffix",
      description: "Suffixet efter max antal deltagare.",
    },
    {
      sectionKey: "registered_status_label",
      type: "text",
      content: "Du är anmäld",
      label: "Status: anmäld",
      description: "Texten som visas när användaren är anmäld.",
    },
    {
      sectionKey: "waitlist_status_label",
      type: "text",
      content: "Du står på reservlistan",
      label: "Status: reservlista",
      description: "Texten som visas när användaren står på reservlistan.",
    },
    {
      sectionKey: "cancel_button_label",
      type: "text",
      content: "Avboka",
      label: "Avboka-knapp",
      description: "Texten på knappen för att avboka anmälan.",
    },
    {
      sectionKey: "register_button_label",
      type: "text",
      content: "Anmäl dig",
      label: "Anmälan: knapptext",
      description: "Texten på knappen för att anmäla sig till ett event.",
    },
    {
      sectionKey: "registration_dialog_description",
      type: "text",
      content: "Bekräfta din anmälan till evenemanget",
      label: "Anmälan: dialogbeskrivning",
      description: "Texten under rubriken i anmälningsdialogen.",
    },
    {
      sectionKey: "registration_notice_title",
      type: "text",
      content: "Viktig information före anmälan",
      label: "Anmälan: informationsrubrik",
      description: "Rubriken ovanför den viktiga informationen i anmälningsdialogen.",
    },
    {
      sectionKey: "registration_accept_label",
      type: "text",
      content: "Jag har läst informationen ovan och förstår att min anmälan registreras i systemet.",
      label: "Anmälan: bekräftelsetext",
      description: "Texten bredvid kryssrutan i anmälningsdialogen.",
    },
    {
      sectionKey: "registration_notes_label",
      type: "text",
      content: "Meddelande (valfritt)",
      label: "Anmälan: anteckningsetikett",
      description: "Etiketten ovanför anteckningsfältet.",
    },
    {
      sectionKey: "registration_notes_placeholder",
      type: "text",
      content: "T.ex. allergier, specialkost, etc.",
      label: "Anmälan: anteckningsplaceholder",
      description: "Placeholdertexten i anteckningsfältet.",
    },
    {
      sectionKey: "registration_cancel_label",
      type: "text",
      content: "Avbryt",
      label: "Anmälan: avbryt-knapp",
      description: "Texten på knappen för att stänga anmälningsdialogen.",
    },
    {
      sectionKey: "registration_confirm_label",
      type: "text",
      content: "Bekräfta anmälan",
      label: "Anmälan: bekräfta-knapp",
      description: "Texten på knappen för att slutföra anmälan.",
    },
    {
      sectionKey: "login_prompt_label",
      type: "text",
      content: "Logga in för att anmäla dig",
      label: "Oinloggad: informationsruta",
      description: "Texten som visas för oinloggade besökare.",
    },
    {
      sectionKey: "calendar_registered_status_label",
      type: "text",
      content: "Du är anmäld till detta event",
      label: "Kalender: status anmäld",
      description: "Statusraden i kalenderns eventdialog när användaren är anmäld.",
    },
    {
      sectionKey: "calendar_cancel_registration_label",
      type: "text",
      content: "Avboka anmälan",
      label: "Kalender: avboka-knapp",
      description: "Texten på knappen för att avboka i kalenderns eventdialog.",
    },
    {
      sectionKey: "calendar_register_button_label",
      type: "text",
      content: "Anmäl dig till eventet",
      label: "Kalender: anmälningsknapp",
      description: "Texten på knappen för att öppna anmälan i kalenderns eventdialog.",
    },
    {
      sectionKey: "calendar_login_prompt_label",
      type: "text",
      content: "Logga in för att anmäla dig till eventet",
      label: "Kalender: oinloggad text",
      description: "Texten som visas i kalenderns eventdialog för oinloggade användare.",
    },
    {
      sectionKey: "calendar_registration_dialog_description",
      type: "text",
      content: "Bekräfta din anmälan. Uppgifterna sparas i evenemangets deltagarlista i adminpanelen.",
      label: "Kalender: dialogbeskrivning",
      description: "Beskrivningen i anmälningsdialogen som öppnas från kalendern.",
    },
    {
      sectionKey: "calendar_registration_accept_label",
      type: "text",
      content: "Jag har läst informationen ovan och vill registrera min anmälan till eventet.",
      label: "Kalender: bekräftelsetext",
      description: "Texten bredvid kryssrutan i kalenderns anmälningsdialog.",
    },
    {
      sectionKey: "calendar_registration_notes_placeholder",
      type: "text",
      content: "T.ex. allergier, specialkost eller annan viktig information",
      label: "Kalender: anteckningsplaceholder",
      description: "Placeholdertexten i anteckningsfältet i kalenderns anmälningsdialog.",
    },
    {
      sectionKey: "empty_state_title",
      type: "text",
      content: "Inga kommande evenemang",
      label: "Tomläge: rubrik",
      description: "Rubriken som visas när det inte finns några event.",
    },
    {
      sectionKey: "empty_state_description",
      type: "text",
      content: "Håll utkik här för framtida aktiviteter!",
      label: "Tomläge: beskrivning",
      description: "Beskrivningen som visas när det inte finns några event.",
    },
  ],
  folkspel: [
    {
      sectionKey: "hero_title",
      type: "text",
      content: "Stöd Föreningen Gamla SSK",
      label: "Hero-rubrik",
      description: "Sidans huvudrubrik överst.",
    },
    {
      sectionKey: "hero_description",
      type: "text",
      content: "Köp lotter och bingolotter. Varje köp stödjer vår förening.",
      label: "Hero-beskrivning",
      description: "Ingressen under huvudrubriken.",
    },
    {
      sectionKey: "hero_button_label",
      type: "text",
      content: "Öppna Folkspels butik",
      label: "Hero: knapptext",
      description: "Texten på huvudknappen högst upp på sidan.",
    },
    {
      sectionKey: "info_title",
      type: "text",
      content: "Så fungerar det",
      label: "Info: rubrik",
      description: "Rubriken för informationskortet.",
    },
    {
      sectionKey: "info_description",
      type: "text",
      content: "Enkelt sätt att stödja föreningen genom att köpa lotter",
      label: "Info: beskrivning",
      description: "Beskrivningen under informationsrubriken.",
    },
    {
      sectionKey: "step_1_title",
      type: "text",
      content: "Välj lotter",
      label: "Steg 1: rubrik",
      description: "Rubriken för första steget.",
    },
    {
      sectionKey: "step_1_description",
      type: "text",
      content: "Bläddra bland BingoLotto, Sverigelotten, JOYNA och fler",
      label: "Steg 1: beskrivning",
      description: "Beskrivningen för första steget.",
    },
    {
      sectionKey: "step_2_title",
      type: "text",
      content: "Köp säkert",
      label: "Steg 2: rubrik",
      description: "Rubriken för andra steget.",
    },
    {
      sectionKey: "step_2_description",
      type: "text",
      content: "Betala tryggt via Folkspels säkra betalningslösning",
      label: "Steg 2: beskrivning",
      description: "Beskrivningen för andra steget.",
    },
    {
      sectionKey: "step_3_title",
      type: "text",
      content: "Stöd föreningen",
      label: "Steg 3: rubrik",
      description: "Rubriken för tredje steget.",
    },
    {
      sectionKey: "step_3_description",
      type: "text",
      content: "En del av intäkterna går direkt till Föreningen Gamla SSK",
      label: "Steg 3: beskrivning",
      description: "Beskrivningen för tredje steget.",
    },
    {
      sectionKey: "notice_html",
      type: "html",
      content: "<p><strong>OBS!</strong> När du klickar på knappen ovan öppnas Folkspels butik i ett nytt fönster. Alla köp hanteras säkert av Folkspel, och föreningen får automatiskt provision.</p>",
      label: "Info: OBS-ruta",
      description: "Texten i den gula informationsrutan.",
    },
    {
      sectionKey: "preview_title",
      type: "text",
      content: "Förhandsvisning av butiken",
      label: "Förhandsvisning: rubrik",
      description: "Rubriken för butikens förhandsvisning.",
    },
    {
      sectionKey: "preview_description",
      type: "text",
      content: "Se vilka produkter som finns tillgängliga (klicka på knappen ovan för att köpa)",
      label: "Förhandsvisning: beskrivning",
      description: "Beskrivningen för butikens förhandsvisning.",
    },
    {
      sectionKey: "preview_button_label",
      type: "text",
      content: "Öppna butiken för att köpa",
      label: "Förhandsvisning: knapptext",
      description: "Texten på knappen under förhandsvisningen.",
    },
    {
      sectionKey: "contact_html",
      type: "html",
      content: "<p>Har du frågor om lotteriet? Kontakta oss på <a href=\"mailto:info@gamlassk.se\">info@gamlassk.se</a></p>",
      label: "Kontakttext",
      description: "Texten längst ned på sidan.",
    },
  ],
  login: [
    {
      sectionKey: "hero_title",
      type: "text",
      content: "Logga in",
      label: "Hero-rubrik",
      description: "Sidans huvudrubrik överst.",
    },
    {
      sectionKey: "hero_description",
      type: "text",
      content: "Använd din e-postadress och ditt lösenord för att komma vidare.",
      label: "Hero-beskrivning",
      description: "Ingressen under huvudrubriken.",
    },
    {
      sectionKey: "card_description",
      type: "text",
      content: "Logga in för att fortsätta.",
      label: "Kortbeskrivning",
      description: "Texten under appnamnet på inloggningssidan.",
    },
  ],
  "reset-password": [
    {
      sectionKey: "hero_title",
      type: "text",
      content: "Återställ lösenord",
      label: "Hero-rubrik",
      description: "Sidans huvudrubrik överst.",
    },
    {
      sectionKey: "hero_description",
      type: "text",
      content: "Välj ett nytt lösenord och slutför återställningen på ett tryggt sätt.",
      label: "Hero-beskrivning",
      description: "Ingressen under huvudrubriken.",
    },
    {
      sectionKey: "form_description",
      type: "text",
      content: "Ange ditt nya lösenord för att slutföra återställningen.",
      label: "Formulärbeskrivning",
      description: "Texten ovanför formuläret när återställning pågår.",
    },
    {
      sectionKey: "complete_description",
      type: "text",
      content: "Ditt lösenord har uppdaterats.",
      label: "Klartext",
      description: "Texten som visas när återställningen är klar.",
    },
  ],
};

function SortableItem({ section, onEdit, onDelete, onTogglePublish }: {
  section: ContentSection;
  onEdit: (section: ContentSection) => void;
  onDelete: (id: number) => void;
  onTogglePublish: (id: number, published: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className={section.published === 0 ? "opacity-60" : ""}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <button
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              >
                <GripVertical className="h-5 w-5 text-gray-400" />
              </button>
              <div>
                <CardTitle className="text-base">{section.sectionKey}</CardTitle>
                <p className="text-xs text-gray-500">{section.type}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onTogglePublish(section.id, section.published === 1 ? 0 : 1)}
                title={section.published === 1 ? "Dölj" : "Publicera"}
              >
                {section.published === 1 ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onEdit(section)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(section.id)}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-700 line-clamp-3">
            {section.content || <span className="text-gray-400 italic">Inget innehåll</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PageEditor({ page }: PageEditorProps) {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [formData, setFormData] = useState({ sectionKey: "", type: "text", content: "" });
  const [showPreview, setShowPreview] = useState(false);

  const { data: contentData, refetch } = trpc.cms.getPageContent.useQuery({ page });

  const updateContentMutation = trpc.cms.updateContent.useMutation({
    onSuccess: () => {
      toast.success("Innehåll uppdaterat!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte uppdatera innehåll");
    },
  });

  const createContentMutation = trpc.cms.createContent.useMutation({
    onSuccess: () => {
      toast.success("Sektion skapad!");
      setIsCreateOpen(false);
      setFormData({ sectionKey: "", type: "text", content: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte skapa sektion");
    },
  });

  const deleteContentMutation = trpc.cms.deleteContent.useMutation({
    onSuccess: () => {
      toast.success("Sektion borttagen!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte ta bort sektion");
    },
  });

  useEffect(() => {
    if (contentData) {
      setSections(contentData as ContentSection[]);
    }
  }, [contentData]);

  const recommendedSections = PAGE_SECTION_TEMPLATES[page] || [];
  const missingRecommendedSections = recommendedSections.filter(
    (template) => !sections.some((section) => section.sectionKey === template.sectionKey),
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update order in database
        newItems.forEach((item, index) => {
          if (item.order !== index) {
            updateContentMutation.mutate({ id: item.id, order: index });
          }
        });

        return newItems;
      });
    }
  };

  const handleEdit = (section: ContentSection) => {
    setEditingSection(section);
    setFormData({
      sectionKey: section.sectionKey,
      type: section.type,
      content: section.content || "",
    });
  };

  const handleUpdate = () => {
    if (!editingSection) return;
    updateContentMutation.mutate({
      id: editingSection.id,
      content: formData.content,
    });
    setEditingSection(null);
  };

  const handleCreate = () => {
    if (!formData.sectionKey || !formData.content) {
      toast.error("Sektionsnyckel och innehåll är obligatoriska");
      return;
    }
    createContentMutation.mutate({
      page,
      sectionKey: formData.sectionKey,
      type: formData.type,
      content: formData.content,
      order: sections.length,
    });
  };

  const handleCreateRecommended = (template: (typeof recommendedSections)[number]) => {
    createContentMutation.mutate({
      page,
      sectionKey: template.sectionKey,
      type: template.type,
      content: template.content,
      order: sections.length,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Är du säker på att du vill ta bort denna sektion?")) {
      deleteContentMutation.mutate({ id });
    }
  };

  const handleTogglePublish = (id: number, published: number) => {
    updateContentMutation.mutate({ id, published });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Redigera innehåll för {page}</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Lägg till sektion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Skapa ny sektion</DialogTitle>
              <DialogDescription>
                Lägg till en ny innehållssektion på sidan
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
              <div>
                <Label htmlFor="sectionKey">Sektionsnyckel *</Label>
                <Input
                  id="sectionKey"
                  value={formData.sectionKey}
                  onChange={(e) => setFormData({ ...formData, sectionKey: e.target.value })}
                  placeholder="t.ex. hero, about, contact"
                />
              </div>
              <div>
                <Label htmlFor="type">Typ</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="text">Text</option>
                  <option value="html">HTML</option>
                  <option value="image">Bild URL</option>
                </select>
              </div>
              <div>
                <Label htmlFor="content">Innehåll *</Label>
                {formData.type === "html" ? (
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                  />
                ) : (
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    placeholder="Skriv innehållet här..."
                  />
                )}
              </div>
            </div>
            <DialogFooter className="border-t pt-4 mt-4">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Avbryt
              </Button>
              <Button onClick={handleCreate}>
                Skapa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {missingRecommendedSections.length > 0 ? (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Föreslagna sektioner</CardTitle>
            <p className="text-sm text-gray-600">
              De här CMS-fälten används redan av sidan men finns inte skapade ännu.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {missingRecommendedSections.map((template) => (
              <div
                key={template.sectionKey}
                className="flex flex-col gap-3 rounded-lg border border-blue-100 bg-white p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold">{template.label}</p>
                  <p className="text-sm text-gray-600">{template.description}</p>
                  <p className="mt-1 text-xs text-gray-500">Nyckel: {template.sectionKey}</p>
                </div>
                <Button
                  onClick={() => handleCreateRecommended(template)}
                  disabled={createContentMutation.isPending}
                >
                  Lägg till
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {sections.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {sections.map((section) => (
                <SortableItem
                  key={section.id}
                  section={section}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onTogglePublish={handleTogglePublish}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Inga sektioner än. Lägg till din första sektion!</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingSection} onOpenChange={(open) => !open && setEditingSection(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Redigera sektion</DialogTitle>
                <DialogDescription>
                  Uppdatera innehållet för {editingSection?.sectionKey}
                </DialogDescription>
              </div>
              {editingSection && (
                <VersionHistory
                  contentId={editingSection.id}
                  onRestore={() => {
                    refetch();
                    setEditingSection(null);
                  }}
                />
              )}
            </div>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="edit-content">Innehåll</Label>
              {formData.type === "html" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  {showPreview ? "Dölj förhandsvisning" : "Visa förhandsvisning"}
                </Button>
              )}
            </div>
            <div className={showPreview && formData.type === "html" ? "grid grid-cols-2 gap-4" : ""}>
              <div>
                {formData.type === "html" ? (
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                  />
                ) : (
                  <Textarea
                    id="edit-content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                  />
                )}
              </div>
              {showPreview && formData.type === "html" && (
                <div className="border rounded-lg p-4 bg-gray-50 overflow-y-auto max-h-[400px]">
                  <p className="text-xs text-gray-500 mb-2 font-semibold">Förhandsvisning:</p>
                  <div
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                    className="prose prose-sm max-w-none"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="border-t pt-4 mt-4">
            <Button variant="outline" onClick={() => setEditingSection(null)}>
              Avbryt
            </Button>
            <Button onClick={handleUpdate}>
              Spara ändringar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
