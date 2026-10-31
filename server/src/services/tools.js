import { z } from 'zod';
import { appointmentsRepo } from '../repositories/appointments.js';
import { ticketsRepo } from '../repositories/tickets.js';
import { conversationsRepo } from '../repositories/conversations.js';
import { withTransaction } from '../config/db.js';
import { logger } from '../utils/logger.js';

const bookAppointmentSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  phone: z.string().trim().min(7, 'Valid phone number is required'),
  department: z.string().trim().min(2, 'Department is required'),
  datetime: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid date/time is required')
});

const createTicketSchema = z.object({
  subject: z.string().trim().min(3, 'Subject is required'),
  description: z.string().trim().min(5, 'Description is required'),
  category: z.string().trim().default('general'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium')
});

const getTicketStatusSchema = z.object({
  ticketCode: z.string().trim().min(3, 'Ticket code is required')
});

const escalateToHumanSchema = z.object({
  reason: z.string().trim().min(3, 'Escalation reason is required')
});

export const toolsService = {
  /**
   * Execute structured tool calls
   */
  async executeTool(action, context = {}) {
    const { type, params = {} } = action;
    const { userId, guestId, conversationId, language = 'en' } = context;

    logger.info(`Executing tool action: ${type}`, { params });

    switch (type) {
      case 'book_appointment': {
        const validated = bookAppointmentSchema.safeParse(params);
        if (!validated.success) {
          return {
            success: false,
            needsMoreInfo: validated.error.errors.map((e) => e.path.join('.')),
            message: 'Missing appointment details'
          };
        }

        const scheduledDate = new Date(validated.data.datetime);
        const record = await appointmentsRepo.create({
          userId,
          guestId,
          conversationId,
          name: validated.data.name,
          phone: validated.data.phone,
          department: validated.data.department,
          scheduledAt: scheduledDate.toISOString()
        });

        const localizedConfirmations = {
          en: `Your appointment has been confirmed with ${record.department} on ${scheduledDate.toLocaleDateString()} at ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          hi: `आपका अपॉइंटमेंट ${record.department} विभाग में ${scheduledDate.toLocaleDateString()} को सफलतापूर्वक बुक हो गया है।`,
          ta: `உங்கள் முன்பதிவு ${record.department} பிரிவில் ${scheduledDate.toLocaleDateString()} அன்று உறுதி செய்யப்பட்டது.`
        };

        return {
          success: true,
          type: 'book_appointment',
          data: record,
          confirmationText: localizedConfirmations[language] || localizedConfirmations.en
        };
      }

      case 'create_ticket': {
        const validated = createTicketSchema.safeParse(params);
        if (!validated.success) {
          return {
            success: false,
            needsMoreInfo: validated.error.errors.map((e) => e.path.join('.')),
            message: 'Missing ticket details'
          };
        }

        const record = await ticketsRepo.create({
          userId,
          guestId,
          conversationId,
          subject: validated.data.subject,
          description: validated.data.description,
          category: validated.data.category,
          priority: validated.data.priority
        });

        const localizedConfirmations = {
          en: `Your ticket has been registered with Ticket ID ${record.ticket_code}. Our team will review it within 24 hours.`,
          hi: `आपकी शिकायत दर्ज कर ली गई है। आपका टिकट कोड ${record.ticket_code} है। हमारी टीम जल्द संपर्क करेगी।`,
          ta: `உங்கள் புகார் பதிவு செய்யப்பட்டது. உங்கள் டிக்கெட் எண் ${record.ticket_code}. 24 மணி நேரத்திற்குள் தீர்வு காணப்படும்.`
        };

        return {
          success: true,
          type: 'create_ticket',
          data: record,
          confirmationText: localizedConfirmations[language] || localizedConfirmations.en
        };
      }

      case 'get_ticket_status': {
        const validated = getTicketStatusSchema.safeParse(params);
        if (!validated.success) {
          return {
            success: false,
            needsMoreInfo: ['ticketCode'],
            message: 'Please provide ticket code'
          };
        }

        const ticket = await ticketsRepo.findByCode(validated.data.ticketCode);
        if (!ticket) {
          const notFoundReplies = {
            en: `I could not find any active ticket with code ${validated.data.ticketCode}. Please verify the code.`,
            hi: `टिकट कोड ${validated.data.ticketCode} के साथ कोई रिकॉर्ड नहीं मिला। कृपया कोड जांचें।`,
            ta: `டிக்கெட் எண் ${validated.data.ticketCode} காணப்படவில்லை. தயவுசெய்து எண்ணை சரிபார்க்கவும்.`
          };
          return {
            success: false,
            type: 'get_ticket_status',
            data: null,
            confirmationText: notFoundReplies[language] || notFoundReplies.en
          };
        }

        const localizedStatus = {
          en: `Ticket ${ticket.ticket_code} (${ticket.subject}) is currently ${ticket.status.toUpperCase()}.`,
          hi: `टिकट ${ticket.ticket_code} की वर्तमान स्थिति '${ticket.status}' है।`,
          ta: `டிக்கெட் ${ticket.ticket_code} தற்போது '${ticket.status}' நிலையில் உள்ளது.`
        };

        return {
          success: true,
          type: 'get_ticket_status',
          data: ticket,
          confirmationText: localizedStatus[language] || localizedStatus.en
        };
      }

      case 'escalate_to_human': {
        const validated = escalateToHumanSchema.safeParse(params);
        const reason = validated.success ? validated.data.reason : 'Customer requested human assistance or repeated low confidence.';

        const summaryText = `Customer escalation initiated.\nReason: ${reason}\nLanguage: ${language}`;

        await conversationsRepo.update(conversationId, {
          status: 'escalated',
          escalated: true,
          escalation_summary: summaryText
        });

        const localizedEscalations = {
          en: 'I have escalated this conversation to our senior duty officer. An executive will join shortly.',
          hi: 'मैंने यह बातचीत हमारे वरिष्ठ अधिकारी को अग्रेषित कर दी है। एक कार्यकारी जल्द ही आपसे संपर्क करेगा।',
          ta: 'நான் இந்த உரையாடலை மனித உதவி அதிகாரிக்கு மாற்றியுள்ளேன். ஒரு நிர்வாகி விரைவில் இணைவார்.'
        };

        return {
          success: true,
          type: 'escalate_to_human',
          data: { reason, summary: summaryText },
          confirmationText: localizedEscalations[language] || localizedEscalations.en
        };
      }

      default:
        return { success: true, type: 'none' };
    }
  }
};
