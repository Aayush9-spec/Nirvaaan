import { sendEmail, emailTemplates } from '@/lib/email';

// Mock fetch
global.fetch = jest.fn();

describe('Email Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'test-email-id' }),
      });

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
      });

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle email sending failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('emailTemplates', () => {
    it('should generate appointment confirmation email', () => {
      const html = emailTemplates.appointmentConfirmation({
        patientName: 'John Doe',
        doctorName: 'Dr. Smith',
        date: '2026-03-15',
        time: '10:00 AM',
        type: 'online',
        meetLink: 'https://meet.google.com/test',
      });

      expect(html).toContain('John Doe');
      expect(html).toContain('Dr. Smith');
      expect(html).toContain('2026-03-15');
      expect(html).toContain('https://meet.google.com/test');
    });

    it('should generate prescription ready email', () => {
      const html = emailTemplates.prescriptionReady({
        patientName: 'Jane Doe',
        doctorName: 'Dr. Johnson',
        prescriptionNumber: 'RX-12345',
      });

      expect(html).toContain('Jane Doe');
      expect(html).toContain('Dr. Johnson');
      expect(html).toContain('RX-12345');
    });
  });
});
