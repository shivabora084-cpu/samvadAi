import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Chat API & Security Guards', () => {
  it('should block non-admin / guest from accessing /api/knowledge or /api/analytics', async () => {
    // 1. Create a guest session
    const guestRes = await request(app)
      .post('/api/auth/guest')
      .send({ preferredLanguage: 'en' });

    const guestToken = guestRes.body.token;

    // 2. Try accessing admin-only knowledge creation
    const adminRes = await request(app)
      .post('/api/knowledge')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        title: 'Hacked Article',
        content: 'Should not be allowed',
        category: 'general'
      });

    expect(adminRes.status).toBe(403);
    expect(adminRes.body.success).toBe(false);
  });

  it('should reject chat message exceeding 1000 characters with 400 Bad Request', async () => {
    const guestRes = await request(app)
      .post('/api/auth/guest')
      .send({ preferredLanguage: 'en' });

    const token = guestRes.body.token;
    const longString = 'a'.repeat(1005);

    const res = await request(app)
      .post('/api/chat/00000000-0000-0000-0000-000000000000/message')
      .set('Authorization', `Bearer ${token}`)
      .send({
        text: longString,
        inputMode: 'text'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject empty message text with 400 Bad Request', async () => {
    const guestRes = await request(app)
      .post('/api/auth/guest')
      .send({ preferredLanguage: 'en' });

    const token = guestRes.body.token;

    const res = await request(app)
      .post('/api/chat/00000000-0000-0000-0000-000000000000/message')
      .set('Authorization', `Bearer ${token}`)
      .send({
        text: '   ',
        inputMode: 'text'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
