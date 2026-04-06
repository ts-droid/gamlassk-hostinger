import ical from 'ical-generator';
import { Event } from '../drizzle/schema';

/**
 * Generate iCal feed for all events
 */
export function generateICalFeed(events: Event[], baseUrl: string): string {
  const calendar = ical({
    name: 'Föreningen Gamla SSK-are Evenemang',
    description: 'Kalender för alla evenemang från Föreningen Gamla SSK-are',
    timezone: 'Europe/Stockholm',
    url: `${baseUrl}/api/calendar/feed.ics`,
    ttl: 3600, // Refresh every hour
  });

  events.forEach((event) => {
    const startDate = new Date(event.eventDate);
    
    // If eventTime is provided, parse it and set the time
    if (event.eventTime) {
      const [hours, minutes] = event.eventTime.split(':').map(Number);
      startDate.setHours(hours, minutes, 0, 0);
    }

    // Default event duration: 2 hours
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2);

    calendar.createEvent({
      start: startDate,
      end: endDate,
      summary: event.title,
      description: event.description || '',
      location: event.location || '',
      url: `${baseUrl}/evenemang/${event.id}`,
    });
  });

  return calendar.toString();
}

/**
 * Generate iCal event for a single event (for "Add to Calendar" button)
 */
export function generateSingleEventICal(event: Event, baseUrl: string): string {
  const calendar = ical({
    name: event.title,
    timezone: 'Europe/Stockholm',
  });

  const startDate = new Date(event.eventDate);
  
  if (event.eventTime) {
    const [hours, minutes] = event.eventTime.split(':').map(Number);
    startDate.setHours(hours, minutes, 0, 0);
  }

  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 2);

  calendar.createEvent({
    start: startDate,
    end: endDate,
    summary: event.title,
    description: event.description || '',
    location: event.location || '',
    url: `${baseUrl}/evenemang/${event.id}`,
  });

  return calendar.toString();
}

/**
 * Generate Google Calendar URL for adding event
 */
export function generateGoogleCalendarUrl(event: Event): string {
  const startDate = new Date(event.eventDate);
  
  if (event.eventTime) {
    const [hours, minutes] = event.eventTime.split(':').map(Number);
    startDate.setHours(hours, minutes, 0, 0);
  }

  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 2);

  // Format dates for Google Calendar (YYYYMMDDTHHmmss)
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: event.description || '',
    location: event.location || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook Calendar URL for adding event
 */
export function generateOutlookCalendarUrl(event: Event, baseUrl: string): string {
  const startDate = new Date(event.eventDate);
  
  if (event.eventTime) {
    const [hours, minutes] = event.eventTime.split(':').map(Number);
    startDate.setHours(hours, minutes, 0, 0);
  }

  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 2);

  // Format dates for Outlook (YYYY-MM-DDTHH:mm:ss)
  const formatDate = (date: Date) => {
    return date.toISOString().split('.')[0];
  };

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: event.description || '',
    location: event.location || '',
    startdt: formatDate(startDate),
    enddt: formatDate(endDate),
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
