import { describe, it, expect } from 'vitest';
import { toolsService } from '../src/services/tools.js';

describe('Tool Actions Execution & Parameter Validation', () => {
  it('should reject booking an appointment when required fields are missing', async () => {
    const result = await toolsService.executeTool(
      {
        type: 'book_appointment',
        params: { name: 'Priya' } // missing phone, department, datetime
      },
      { language: 'en' }
    );

    expect(result.success).toBe(false);
    expect(result.needsMoreInfo).toContain('phone');
    expect(result.needsMoreInfo).toContain('department');
    expect(result.needsMoreInfo).toContain('datetime');
  });

  it('should reject creating a ticket when subject or description is missing', async () => {
    const result = await toolsService.executeTool(
      {
        type: 'create_ticket',
        params: { subject: 'Hi' } // description missing and subject too short
      },
      { language: 'en' }
    );

    expect(result.success).toBe(false);
    expect(result.needsMoreInfo).toBeDefined();
  });

  it('should validate ticket code lookup when code is missing', async () => {
    const result = await toolsService.executeTool(
      {
        type: 'get_ticket_status',
        params: {}
      },
      { language: 'en' }
    );

    expect(result.success).toBe(false);
    expect(result.needsMoreInfo).toContain('ticketCode');
  });

  it('should return none for unknown action', async () => {
    const result = await toolsService.executeTool(
      { type: 'none', params: {} },
      { language: 'en' }
    );
    expect(result.success).toBe(true);
    expect(result.type).toBe('none');
  });
});
