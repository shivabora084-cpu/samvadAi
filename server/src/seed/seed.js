import bcrypt from 'bcryptjs';
import { pool, withTransaction } from '../config/db.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const KNOWLEDGE_ITEMS = [
  {
    title: 'OPD Timings and Registration',
    category: 'timings',
    language: 'en',
    tags: ['opd', 'timings', 'hours', 'registration', 'doctors', 'working days'],
    content: 'Outpatient Department (OPD) operates Monday to Saturday from 8:00 AM to 1:00 PM and 2:00 PM to 5:00 PM. Registration counter opens at 7:30 AM and token issuance closes at 4:30 PM. Sunday OPD remains closed, but 24/7 Emergency and Trauma care operates without interruption.'
  },
  {
    title: 'ओपीडी का समय और पंजीकरण (OPD Timings Hindi)',
    category: 'timings',
    language: 'hi',
    tags: ['ओपीडी', 'समय', 'पंजीकरण', 'डॉक्टर', 'रविवार', 'घंटे'],
    content: 'सिटी केयर अस्पताल की ओपीडी (OPD) सोमवार से शनिवार सुबह 8:00 बजे से दोपहर 1:00 बजे तक और दोपहर 2:00 बजे से शाम 5:00 बजे तक खुली रहती है। पंजीकरण काउंटर सुबह 7:30 बजे खुलता है। रविवार को सामान्य ओपीडी बंद रहती है, लेकिन आपातकालीन सेवा (Emergency) 24 घंटे उपलब्ध रहती है।'
  },
  {
    title: 'ஓபிடி நேரம் மற்றும் பதிவு (OPD Timings Tamil)',
    category: 'timings',
    language: 'ta',
    tags: ['ஓபிடி', 'நேரம்', 'பதிவு', 'மருத்துவர்', 'ஞாயிறு', 'அவசர சிகிச்சை'],
    content: 'சிட்டி கேர் மருத்துவமனையின் புறநோயாளிகள் பிரிவு (OPD) திங்கள் முதல் சனிக்கிழமை வரை காலை 8:00 மணி முதல் மதியம் 1:00 மணி வரையிலும், மதியம் 2:00 மணி முதல் மாலை 5:00 மணி வரையிலும் இயங்கும். டோக்கன் பதிவு காலை 7:30 மணிக்கு தொடங்கும். ஞாயிற்றுக்கிழமைகளில் அவசர சிகிச்சை பிரிவு (Emergency) 24 மணி நேரமும் செயல்படும்.'
  },
  {
    title: 'Hospital Departments and Available Specialties',
    category: 'services',
    language: 'en',
    tags: ['departments', 'specialties', 'cardiology', 'orthopedics', 'pediatrics', 'gynecology', 'ent', 'neurology'],
    content: 'City Care Hospital has 12 specialized departments: General Medicine, Cardiology, Orthopedics, Pediatrics, Obstetrics & Gynecology, ENT, Ophthalmology, Dermatology, General Surgery, Neurology, Pulmonology, and Psychiatry. Senior consultants are available during OPD hours.'
  },
  {
    title: 'चिकित्सा विभाग और विशेषज्ञ (Hospital Departments Hindi)',
    category: 'services',
    language: 'hi',
    tags: ['विभाग', 'हृदय रोग', 'हड्डी', 'बाल रोग', 'स्त्री रोग', 'ईएनटी', 'डॉक्टर'],
    content: 'अस्पताल में प्रमुख विभाग हैं: सामान्य चिकित्सा (General Medicine), हृदय रोग (Cardiology), हड्डी रोग (Orthopedics), बाल रोग (Pediatrics), स्त्री एवं प्रसूति रोग (Gynecology), कान-नाक-गला (ENT), और नेत्र रोग। सभी वरिष्ठ विशेषज्ञ ओपीडी समय में परामर्श के लिए उपलब्ध हैं।'
  },
  {
    title: 'மருத்துவ துறைகள் மற்றும் நிபுணர்கள் (Hospital Departments Tamil)',
    category: 'services',
    language: 'ta',
    tags: ['துறைகள்', 'இதயம்', 'எலும்பு முறிவு', 'குழந்தைகள் நலம்', 'மகளிர் நலம்', 'மருத்துவர்கள்'],
    content: 'மருத்துவமனையில் பொது மருத்துவம், இதயவியல் (Cardiology), எலும்பியல் (Orthopedics), குழந்தைகள் நலம் (Pediatrics), மகப்பேறு மற்றும் மகளிர் நலம் (Gynecology), கண் மருத்துவம் மற்றும் காது-மூக்கு-தொண்டை (ENT) துறைகள் உள்ளன.'
  },
  {
    title: 'Consultation Fees and Diagnostic Charges',
    category: 'billing',
    language: 'en',
    tags: ['fee', 'charges', 'cost', 'consultation', 'doctor fee', 'rates', 'xray', 'mri'],
    content: 'General physician OPD registration fee is ₹100. Specialist consultation fee is ₹300, valid for follow-up visits within 7 days. Senior citizens (above 60 years) receive a 50% concession on registration. Routine blood tests (CBC, Blood Sugar) cost between ₹80 and ₹250. Digital X-Ray starts from ₹200.'
  },
  {
    title: 'कंसल्टेशन फीस और जांच शुल्क (Fees Hindi)',
    category: 'billing',
    language: 'hi',
    tags: ['फीस', 'शुल्क', 'परामर्श', 'जांच', 'एक्स-रे', 'वरिष्ठ नागरिक', 'रियायत'],
    content: 'सामान्य चिकित्सक की ओपीडी फीस ₹100 है। विशेषज्ञ डॉक्टर का परामर्श शुल्क ₹300 है जो 7 दिनों के फॉलो-अप के लिए मान्य रहता है। 60 वर्ष से अधिक उम्र के वरिष्ठ नागरिकों के लिए पंजीकरण शुल्क में 50% की छूट है। बुनियादी रक्त जांच ₹80 से ₹250 के बीच होती है।'
  },
  {
    title: 'மருத்துவர் கட்டணம் மற்றும் பரிசோதனை கட்டணம் (Fees Tamil)',
    category: 'billing',
    language: 'ta',
    tags: ['கட்டணம்', 'பரிசோதனை', 'முதியோர் சலுகை', 'ரத்த பரிசோதனை', 'எக்ஸ்ரே'],
    content: 'பொது மருத்துவர் கட்டணம் ₹100. சிறப்பு மருத்துவர் ஆலோசனைக் கட்டணம் ₹300 (7 நாட்களுக்கு செல்லுபடியாகும்). 60 வயதுக்கு மேற்பட்ட முதியவர்களுக்கு 50% கட்டண சலுகை உண்டு. அடிப்படை ரத்தப் பரிசோதனைகள் ₹80 முதல் ஆரம்பமாகிறது.'
  },
  {
    title: 'Documents Required for OPD and IPD Admission',
    category: 'admission',
    language: 'en',
    tags: ['documents', 'id proof', 'aadhaar', 'abha', 'admission', 'insurance card'],
    content: 'For OPD registration, please present any Government Photo ID (Aadhaar Card, Voter ID, or Driving License) along with your ABHA (Ayushman Bharat Health Account) ID if available. For Inpatient (IPD) admission, carry patient photo ID, address proof, 2 passport photos, and health insurance card or TPA pre-authorization form.'
  },
  {
    title: 'Appointment Booking and Cancellation Process',
    category: 'appointments',
    language: 'en',
    tags: ['appointment', 'booking', 'cancel', 'reschedule', 'slot', 'token', 'online'],
    content: 'Appointments can be booked via SamvadAI conversational assistant, our website, or by calling our booking helpline at 044-24567800. Appointments can be rescheduled or cancelled up to 2 hours before the allotted slot with no penalty or cancellation fee.'
  },
  {
    title: 'Lab Reports and Diagnostic Test Collection',
    category: 'lab',
    language: 'en',
    tags: ['lab report', 'blood test', 'radiology', 'download', 'results', 'timing'],
    content: 'Routine biochemistry and hematology reports are ready within 4 hours. Special culture tests take 24-48 hours. Patients can download password-protected PDF reports from our web portal using their registered mobile number and Patient ID, or collect printed reports from Counter 4 between 8:00 AM and 8:00 PM.'
  },
  {
    title: '24/7 Emergency, Trauma Care and Ambulance Numbers',
    category: 'emergency',
    language: 'en',
    tags: ['emergency', 'ambulance', 'trauma', 'phone', 'helpline', 'urgent', 'casualty', 'icu'],
    content: 'For immediate life-threatening medical emergencies, dial our direct Emergency Hotline: 044-24567890 or toll-free 108. Our Advanced Life Support (ALS) and Basic Life Support (BLS) ambulances are equipped with oxygen and cardiac monitors, providing rapid transit within a 25 km radius.'
  },
  {
    title: 'आपातकालीन सेवा और एम्बुलेंस नंबर (Emergency Hindi)',
    category: 'emergency',
    language: 'hi',
    tags: ['आपातकाल', 'एम्बुलेंस', 'इमरजेंसी', 'फोन नंबर', 'हेल्पलाइन', 'दुर्घटना'],
    content: 'चिकित्सा आपातकाल के लिए सीधे हमारे 24 घंटे आपातकालीन नंबर 044-24567890 पर कॉल करें या 108 डायल करें। हमारी एम्बुलेंस सेवा ऑक्सीजन और वेंटिलेटर से सुसज्जित है और 25 किलोमीटर के दायरे में त्वरित सहायता प्रदान करती है।'
  },
  {
    title: 'अவசர சிகிச்சை மற்றும் ஆம்புலன்ஸ் எண் (Emergency Tamil)',
    category: 'emergency',
    language: 'ta',
    tags: ['அவசர சிகிச்சை', 'ஆம்புலன்ஸ்', 'தொலைபேசி எண்', 'உதவி எண்', 'விபத்து'],
    content: 'அவசர மருத்துவ தேவைக்கு உடனே 044-24567890 அல்லது 108 என்ற எண்ணை அழைக்கவும். அவசர சிகிச்சை மற்றும் அதிதீவிர சிகிச்சைப் பிரிவு (ICU) 24 மணி நேரமும் மருத்துவர்களுடன் இயங்குகிறது.'
  },
  {
    title: 'Insurance, Cashless Mediclaim, and Ayushman Bharat (PM-JAY)',
    category: 'insurance',
    language: 'en',
    tags: ['insurance', 'cashless', 'mediclaim', 'tpa', 'ayushman bharat', 'pmjay', 'cghs'],
    content: 'City Care Hospital is empaneled with all major government and private TPAs including Star Health, ICICI Lombard, HDFC ERGO, Medi Assist, Paramount, and Raksha TPA. We honor Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY) and State Government Employees health insurance. Visit the TPA Helpdesk at Room 102.'
  },
  {
    title: 'Visitor Policy and Visiting Hours',
    category: 'guidelines',
    language: 'en',
    tags: ['visitor', 'visiting hours', 'icu visit', 'pass', 'attendant', 'family'],
    content: 'General Ward visiting hours are 5:00 PM to 7:00 PM daily. Intensive Care Unit (ICU / CCU) visiting is strictly limited to 4:00 PM to 5:00 PM with only one visitor allowed per patient. All visitors must obtain an Attendant / Visitor Pass from the Security Desk.'
  },
  {
    title: 'Vaccination and Immunization Clinic',
    category: 'vaccination',
    language: 'en',
    tags: ['vaccination', 'immunization', 'baby vaccine', 'rabies', 'hepatitis', 'polio', 'bcg'],
    content: 'The Immunization Center at Room 108 operates Monday, Wednesday, and Friday from 9:00 AM to 1:00 PM. All Universal Immunization Program (UIP) infant vaccines (BCG, Polio, Pentavalent, MR) are administered free of charge. Rabies Anti-Rabies Vaccine (ARV) and Immunoglobulin are available 24/7 in Casualty.'
  },
  {
    title: 'Citizen Grievance Redressal and Patient Support',
    category: 'support',
    language: 'en',
    tags: ['grievance', 'complaint', 'feedback', 'help desk', 'escalation', 'ombudsman'],
    content: 'If you encounter any difficulty with hospital staff, billing discrepancies, or undue delays, submit a ticket via SamvadAI assistant or contact the Public Grievance Officer on Floor 1, Room 105 (Email: grievances@citycarehospital.org, Phone: 044-24567855). Inquiries are resolved within 48 working hours.'
  }
];

export async function seedDatabase() {
  logger.info('Starting SamvadAI database seed...');

  const client = await pool.connect();
  try {
    // 1. Seed Admin User
    const adminEmail = 'admin@samvadai.com';
    const adminPassword = env.SEED_ADMIN_PASSWORD || 'Admin@Samvad2025!';
    const salt = await bcrypt.genSalt(12);
    const adminHash = await bcrypt.hash(adminPassword, salt);

    const { rows: existingAdmin } = await client.query(
      'SELECT id FROM users WHERE lower(email) = lower($1)',
      [adminEmail]
    );

    let adminId;
    if (existingAdmin.length === 0) {
      const res = await client.query(
        `INSERT INTO users (name, email, password_hash, role, preferred_language)
         VALUES ($1, lower($2), $3, $4, $5) RETURNING id`,
        ['Dr. Ramesh Sharma (Admin)', adminEmail, adminHash, 'admin', 'en']
      );
      adminId = res.rows[0].id;
      logger.info(`✓ Admin user created: ${adminEmail}`);
    } else {
      adminId = existingAdmin[0].id;
      await client.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [adminHash, adminId]
      );
      logger.info(`✓ Admin user updated: ${adminEmail}`);
    }

    // 2. Seed Demo Customer User
    const demoEmail = 'priya@example.com';
    const demoHash = await bcrypt.hash('Priya@123', salt);
    let customerId;
    const { rows: existingCustomer } = await client.query(
      'SELECT id FROM users WHERE lower(email) = lower($1)',
      [demoEmail]
    );

    if (existingCustomer.length === 0) {
      const res = await client.query(
        `INSERT INTO users (name, email, password_hash, role, preferred_language)
         VALUES ($1, lower($2), $3, $4, $5) RETURNING id`,
        ['Priya Patel', demoEmail, demoHash, 'customer', 'hi']
      );
      customerId = res.rows[0].id;
      logger.info(`✓ Demo customer created: ${demoEmail}`);
    } else {
      customerId = existingCustomer[0].id;
    }

    // 3. Seed Knowledge Base Entries
    let insertedKnowledge = 0;
    for (const item of KNOWLEDGE_ITEMS) {
      const { rows: exists } = await client.query(
        'SELECT id FROM knowledge_entries WHERE title = $1',
        [item.title]
      );

      if (exists.length === 0) {
        await client.query(
          `INSERT INTO knowledge_entries (title, content, category, tags, language, active)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [item.title, item.content, item.category, item.tags, item.language, true]
        );
        insertedKnowledge++;
      }
    }
    logger.info(`✓ Knowledge base seeded (${insertedKnowledge} new entries added, total ${KNOWLEDGE_ITEMS.length})`);

    // 4. Seed Demo Conversations & Messages for Dashboard Realism
    const { rows: convCount } = await client.query('SELECT count(*)::int as count FROM conversations');
    if (convCount[0].count === 0) {
      logger.info('Seeding realistic demo conversations, tickets, and appointments...');

      // Conversation 1: English - OPD timing inquiry (Resolved)
      const conv1 = await client.query(
        `INSERT INTO conversations (user_id, language, status, summary, intents, sentiment_avg, sentiment_trend, escalated, resolution, rating, started_at, ended_at)
         VALUES ($1, 'en', 'resolved', 'Patient inquired regarding OPD registration hours and cardiologist availability. Provided OPD schedule and booking instructions.',
         ARRAY['timings', 'faq'], 0.85, '[0.5, 0.8, 1.0]'::jsonb, false, 'Patient satisfied with OPD details.', 5, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '4 minutes')
         RETURNING id`,
        [customerId]
      );
      const c1Id = conv1.rows[0].id;

      await client.query(
        `INSERT INTO messages (conversation_id, role, text, language, input_mode, intent, sentiment, sentiment_score, confidence, latency_ms) VALUES
         ($1, 'user', 'What time does the OPD open tomorrow morning?', 'en', 'voice', 'timings', 'neutral', 0.5, 0.98, 240),
         ($1, 'assistant', 'The OPD opens at 8:00 AM tomorrow. Registration counters start at 7:30 AM.', 'en', 'text', 'timings', 'positive', 0.8, 0.99, 1150),
         ($1, 'user', 'Thank you! Can I see Dr. Mehta in Cardiology?', 'en', 'voice', 'faq', 'positive', 1.0, 0.95, 310),
         ($1, 'assistant', 'Yes, Dr. Mehta is available in the Cardiology OPD from 9:00 AM to 1:00 PM. Would you like me to book an appointment for you?', 'en', 'text', 'book_appointment', 'positive', 0.9, 0.97, 1220)`,
        [c1Id]
      );

      // Conversation 2: Hindi - Ayushman Bharat inquiry (Resolved)
      const conv2 = await client.query(
        `INSERT INTO conversations (guest_id, language, status, summary, intents, sentiment_avg, sentiment_trend, escalated, resolution, rating, started_at, ended_at)
         VALUES ('guest_demo_hindi_1', 'hi', 'resolved', 'नागरिक ने आयुष्मान भारत (PM-JAY) योजना के तहत निशुल्क उपचार और आवश्यक दस्तावेजों की जानकारी प्राप्त की।',
         ARRAY['insurance', 'faq'], 0.60, '[0.4, 0.7]'::jsonb, false, 'योजना के सभी दिशा-निर्देश साझा किए गए।', 5, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '3 minutes')
         RETURNING id`
      );
      const c2Id = conv2.rows[0].id;

      await client.query(
        `INSERT INTO messages (conversation_id, role, text, language, input_mode, intent, sentiment, sentiment_score, confidence, latency_ms) VALUES
         ($1, 'user', 'क्या आपके अस्पताल में आयुष्मान भारत कार्ड से इलाज होता है?', 'hi', 'voice', 'insurance', 'neutral', 0.4, 0.96, 280),
         ($1, 'assistant', 'हाँ, हमारे अस्पताल में आयुष्मान भारत (PM-JAY) कार्ड स्वीकार किया जाता है। आप कमरा नंबर 102 में टीपीए डेस्क से संपर्क कर सकते हैं।', 'hi', 'text', 'insurance', 'positive', 0.8, 0.98, 1340)`,
        [c2Id]
      );

      // Conversation 3: Tamil - Lab report inquiry (Resolved)
      const conv3 = await client.query(
        `INSERT INTO conversations (guest_id, language, status, summary, intents, sentiment_avg, sentiment_trend, escalated, resolution, rating, started_at, ended_at)
         VALUES ('guest_demo_tamil_1', 'ta', 'resolved', 'நோயாளி தனது ரத்தப் பரிசோதனை முடிவுகளை ஆன்லைனில் எவ்வாறு பதிவிறக்குவது என்பது குறித்து கேட்டறிந்தார்.',
         ARRAY['lab', 'faq'], 0.90, '[0.8, 1.0]'::jsonb, false, 'ஆன்லைன் அறிக்கை பதிவிறக்கும் முறை விளக்கப்பட்டது.', 4, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours' + INTERVAL '2 minutes')
         RETURNING id`
      );
      const c3Id = conv3.rows[0].id;

      await client.query(
        `INSERT INTO messages (conversation_id, role, text, language, input_mode, intent, sentiment, sentiment_score, confidence, latency_ms) VALUES
         ($1, 'user', 'என் ரத்தப் பரிசோதனை ரிப்போர்ட் எப்போது கிடைக்கும்?', 'ta', 'voice', 'lab', 'neutral', 0.5, 0.97, 260),
         ($1, 'assistant', 'பொதுவான ரத்தப் பரிசோதனை முடிவுகள் 4 மணி நேரத்திற்குள் தயாராகிவிடும். நீங்கள் இணையதளம் மூலமாகவோ அல்லது கவுண்டர் 4-ல் பெற்றுக்கொள்ளலாம்.', 'ta', 'text', 'lab', 'positive', 0.95, 0.99, 1180)`,
        [c3Id]
      );

      // Conversation 4: English - Escalated complaint
      const conv4 = await client.query(
        `INSERT INTO conversations (user_id, language, status, summary, intents, sentiment_avg, sentiment_trend, escalated, escalation_summary, resolution, started_at)
         VALUES ($1, 'en', 'escalated', 'Severe patient grievance regarding 2-hour wait in emergency casualty triage without attending physician.',
         ARRAY['complaint', 'escalate'], -0.80, '[-0.6, -0.9, -1.0]'::jsonb, true,
         '1. Patient in casualty triage for 2+ hours with acute pain.\n2. No senior physician assigned despite repeated requests.\n3. Escalated to Medical Superintendent and on-duty Duty Officer.',
         'Assigned to Duty Medical Officer Dr. Ananya for immediate intervention.', NOW() - INTERVAL '1 hour')
         RETURNING id`,
        [customerId]
      );
      const c4Id = conv4.rows[0].id;

      await client.query(
        `INSERT INTO messages (conversation_id, role, text, language, input_mode, intent, sentiment, sentiment_score, confidence, latency_ms) VALUES
         ($1, 'user', 'I have been waiting in emergency casualty for 2 hours and no doctor has attended to my father who is in pain!', 'en', 'voice', 'complaint', 'negative', -0.8, 0.95, 290),
         ($1, 'assistant', 'I deeply apologize for this severe delay. Let me immediately escalate this to the Casualty Duty Medical Officer for priority assistance.', 'en', 'text', 'escalate', 'negative', -0.6, 0.99, 980)`,
        [c4Id]
      );

      // 5. Seed Demo Tickets
      await client.query(
        `INSERT INTO tickets (ticket_code, user_id, conversation_id, subject, description, category, priority, status, created_at) VALUES
         ('SV-1001', $1, $2, 'Delayed Emergency Triage Attendance', 'Patient waiting over 2 hours in Casualty Room 4 with acute abdominal pain.', 'emergency', 'urgent', 'in_progress', NOW() - INTERVAL '1 hour'),
         ('SV-1002', $1, $3, 'Ayushman Bharat Pre-authorization Delay', 'Document verification pending at Room 102 TPA desk for knee arthroscopy.', 'insurance', 'high', 'open', NOW() - INTERVAL '18 hours'),
         ('SV-1003', NULL, $4, 'Online Lab Report Download Portal 502 Error', 'SMS link for downloading lipid profile report returned server timeout.', 'technical', 'medium', 'resolved', NOW() - INTERVAL '2 days')`,
        [customerId, c4Id, c2Id, c3Id]
      );

      // 6. Seed Demo Appointments
      await client.query(
        `INSERT INTO appointments (user_id, conversation_id, name, phone, department, scheduled_at, status) VALUES
         ($1, $2, 'Priya Patel', '9876543210', 'Cardiology', NOW() + INTERVAL '1 day' + INTERVAL '3 hours', 'booked'),
         (NULL, $3, 'Ravi Kumar', '9845123456', 'Orthopedics', NOW() + INTERVAL '2 days' + INTERVAL '4 hours', 'booked'),
         (NULL, $4, 'Selvanathan M', '9443129876', 'Pediatrics', NOW() - INTERVAL '1 day', 'booked')`,
        [customerId, c1Id, c2Id, c3Id]
      );

      logger.info('✓ Demo conversations, messages, tickets, and appointments successfully seeded');
    }

    logger.info('🎉 Database seeding completed successfully!');
  } catch (err) {
    logger.error('Database seeding failed:', { message: err.message, stack: err.stack });
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}
