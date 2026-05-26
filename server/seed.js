import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'travelplusnovo',
  port: process.env.DB_PORT || 3306,
};

async function seed() {
  const db = await mysql.createConnection(dbConfig);
  console.log('🔌 Spojen na bazu podataka');

  try {
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = ['service_metrics','service_incidents','ola_agreements','service_requirements','sla_contracts','service_levels','cost_allocations','revenues','expenses','bookings','budgets','products','destinations','suppliers','customers'];
    for (const t of tables) await db.query(`TRUNCATE TABLE ${t}`).catch(() => {});
    
    // Try to create vendor_invoices if not exists
    await db.query(`CREATE TABLE IF NOT EXISTS vendor_invoices (
      id INT PRIMARY KEY AUTO_INCREMENT,
      supplier_id INT,
      invoice_number VARCHAR(50) UNIQUE NOT NULL,
      invoice_date DATE NOT NULL,
      due_date DATE,
      amount DECIMAL(10,2) NOT NULL,
      description TEXT,
      status ENUM('unpaid','paid','overdue','disputed') NOT NULL DEFAULT 'unpaid',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
    )`).catch(() => {});

    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    // CUSTOMERS
    await db.query(`INSERT INTO customers (id, name, email, phone, customer_type, service_tier) VALUES
      (1, 'Lejla Hadžić', 'lejla.hadzic@gmail.com', '+38761111111', 'individual', 'premium'),
      (2, 'Amar Kovačević', 'amar.kovacevic@gmail.com', '+38762222222', 'individual', 'standard'),
      (3, 'GlobalTech d.o.o.', 'travel@globaltech.ba', '+38733333444', 'corporate', 'premium'),
      (4, 'Sara Mujić', 'sara.mujic@gmail.com', '+38763333333', 'individual', 'standard'),
      (5, 'Bosnia Business Group', 'office@bbg.ba', '+38733444555', 'corporate', 'premium'),
      (6, 'Haris Softić', 'haris.softic@gmail.com', '+38765666777', 'individual', 'standard'),
      (7, 'Amra Delić', 'amra.delic@hotmail.com', '+38762777888', 'individual', 'premium'),
      (8, 'Adriatic Commerce d.o.o.', 'meetings@adriaticcommerce.ba', '+38733999000', 'corporate', 'premium')`);
    console.log('✅ Klijenti uneseni');

    // SUPPLIERS
    await db.query(`INSERT INTO suppliers (id, name, type, contact_email, contact_phone, country) VALUES
      (1, 'Hotel Azure Dubrovnik', 'hotel', 'sales@hotelazure.hr', '+38520111222', 'Hrvatska'),
      (2, 'AdriaFly Airlines', 'airline', 'partners@adriafly.com', '+38513131313', 'Hrvatska'),
      (3, 'Balkan Transfer Services', 'transport', 'info@balkantransfer.ba', '+38760123456', 'Bosna i Hercegovina'),
      (4, 'SafeTrip Osiguranje', 'insurance', 'claims@safetrip.ba', '+38733222111', 'Bosna i Hercegovina'),
      (5, 'Hotel Istanbul Comfort', 'hotel', 'booking@istanbulcomfort.tr', '+90212111222', 'Turska'),
      (6, 'Hotel Colosseum Roma', 'hotel', 'reservations@colosseumrome.it', '+3906111222', 'Italija'),
      (7, 'Turkish Airlines Cargo', 'airline', 'ba@turkishairlines.com', '+90212333444', 'Turska'),
      (8, 'Antalya Luxury Resort', 'hotel', 'groups@antalyaluxury.tr', '+90242555666', 'Turska'),
      (9, 'AutoBus Sarajevo-Split', 'transport', 'info@sassplit.ba', '+38733777888', 'Bosna i Hercegovina'),
      (10, 'Globetrotter Osiguranje', 'insurance', 'info@globetrotter.ba', '+38733100200', 'Bosna i Hercegovina')`);
    console.log('✅ Dobavljači uneseni');

    // DESTINATIONS
    await db.query(`INSERT INTO destinations (id, name, country, season, description, is_active) VALUES
      (1, 'Dubrovnik', 'Hrvatska', 'summer', 'Bisjer Jadrana - luksuzna ljetna destinacija sa prekrasnim plažama i starim gradom.', true),
      (2, 'Istanbul', 'Turska', 'year_round', 'Grad na dva kontinenta - bogata historija, bazari i gastronomija.', true),
      (3, 'Rim', 'Italija', 'year_round', 'Vječni grad - Koloseum, Vatikan i mediteranska kuhinja.', true),
      (4, 'Antalija', 'Turska', 'summer', 'All-inclusive raj na Turskoj rivijeri sa kristalno čistim morem.', true),
      (5, 'Beč', 'Austrija', 'winter', 'Carski grad - muzika, kultura i božićni sajmovi.', true),
      (6, 'Pariz', 'Francuska', 'year_round', 'Grad svjetlosti - Eiffelov toranj, moda i haute cuisine.', true),
      (7, 'Barcelona', 'Španija', 'summer', 'Gaudijeva arhitektura, La Rambla i mediteranska obala.', true),
      (8, 'Sarajevo', 'Bosna i Hercegovina', 'year_round', 'Čaršija, diverzitet kultura i ulazna tačka za BiH turizam.', true)`);
    console.log('✅ Destinacije unesene');

    // PRODUCTS
    await db.query(`INSERT INTO products (id, name, destination_id, type, base_price, season, description, is_active) VALUES
      (1, 'Dubrovnik Premium Paket 7 dana', 1, 'package', 1850.00, 'summer', 'Luksuzni hotel 5*, izleti brodom, transfer.', true),
      (2, 'Istanbul City Break 4 dana', 2, 'package', 780.00, 'year_round', 'Hotel 4*, obilazak Aja Sofije, Bosfor, Grand Bazar.', true),
      (3, 'Roma Classica 5 dana', 3, 'package', 1200.00, 'year_round', 'Hotel 4*, Vatikan, Koloseum, fontana di Trevi.', true),
      (4, 'Antalija All Inclusive 10 dana', 4, 'package', 2100.00, 'summer', '5* resort, all inclusive, akvapark, spa.', true),
      (5, 'Beč Advent 3 dana', 5, 'package', 680.00, 'winter', 'Hotel 4*, božićni sajam, Schönbrunn, Opera.', true),
      (6, 'Pariz Romantika 5 dana', 6, 'package', 1650.00, 'year_round', 'Hotel 4*, Eiffel, Louvre, krstarenje Senom.', true),
      (7, 'Barcelona Beach & Culture 6 dana', 7, 'package', 1420.00, 'summer', 'Hotel 4*, Gaudí tura, Camp Nou, plaža.', true),
      (8, 'Dubrovnik Poslovni Travel', 1, 'business_travel', 2400.00, 'year_round', 'Hotel 5*, konferencijska sala, VIP transfer.', true),
      (9, 'Custom Mediteran Krstarenje', 3, 'cruise', 3800.00, 'summer', 'Luksuzna krstarenje Mediteranom 12 dana.', true)`);
    console.log('✅ Proizvodi uneseni');

    // BUDGETS
    await db.query(`INSERT INTO budgets (id, season, year, planned_revenue, planned_expenses, marketing_budget, operations_budget, status, notes) VALUES
      (1, 'Ljeto 2026', 2026, 520000.00, 310000.00, 35000.00, 75000.00, 'active', 'Glavni ljetni budžet - fokus na Dubrovnik i Antalija aranžmane. Prognoza: +210.000 KM bruto.'),
      (2, 'Zima 2025', 2025, 195000.00, 130000.00, 15000.00, 42000.00, 'closed', 'Zimski budžet zatvoren - ostvaren prihod 195.000 KM, premasen plan za 8%.'),
      (3, 'Proljeće 2026', 2026, 240000.00, 155000.00, 20000.00, 48000.00, 'approved', 'Proljetni budžet odobren za grad-break destinacije. Projekcija dobiti: +85.000 KM.'),
      (4, 'Jesen 2026', 2026, 210000.00, 140000.00, 18000.00, 45000.00, 'draft', 'Nacrt jesenskog budžeta u pripremi. Planirani prihod: 210.000 KM.')`);
    console.log('✅ Budžeti uneseni');

    // BOOKINGS
    await db.query(`INSERT INTO bookings (id, booking_number, customer_id, product_id, booking_date, travel_date, status, total_price, cost_price, net_profit, number_of_travelers, notes) VALUES
      (1, 'TP-2026-0001', 1, 1, '2026-01-10', '2026-07-15', 'confirmed', 3700.00, 2900.00, 800.00, 2, 'Medeni mesec paket - soba s pogledom na more.'),
      (2, 'TP-2026-0002', 2, 4, '2026-02-05', '2026-08-03', 'confirmed', 4200.00, 3200.00, 1000.00, 2, 'All-inclusive Antalija.'),
      (3, 'TP-2026-0003', 3, 8, '2026-02-20', '2026-03-15', 'completed', 7200.00, 5400.00, 1800.00, 3, 'Korporativni put GlobalTech - godišnja konferencija.'),
      (4, 'TP-2026-0004', 5, 9, '2026-03-01', '2026-06-20', 'confirmed', 11400.00, 8500.00, 2900.00, 3, 'Luksuzno krstarenje za BBG korporativni tim.'),
      (5, 'TP-2026-0005', 4, 2, '2026-03-10', '2026-05-02', 'completed', 1560.00, 1200.00, 360.00, 2, 'Istanbul city break za Bajramske praznike.'),
      (6, 'TP-2026-0006', 7, 6, '2026-03-15', '2026-09-12', 'confirmed', 3300.00, 2500.00, 800.00, 2, 'Romantični Pariz.'),
      (7, 'TP-2026-0007', 6, 5, '2026-04-01', '2026-12-20', 'pending', 1360.00, 1050.00, 310.00, 2, 'Beč adventski sajam.'),
      (8, 'TP-2026-0008', 8, 8, '2026-04-05', '2026-05-22', 'confirmed', 9600.00, 7200.00, 2400.00, 4, 'Adriatic Commerce poslovni boravak Dubrovnik.')`);
    console.log('✅ Rezervacije unesene');

    // EXPENSES
    await db.query(`INSERT INTO expenses (budget_id, supplier_id, category, description, amount, expense_date, payment_status) VALUES
      (1, 1, 'accommodation', 'Hotel Azure Dubrovnik - 30 noćenja, Srpanj 2026', 28500.00, '2026-01-15', 'paid'),
      (1, 3, 'transport', 'Autobusni transfer Sarajevo-Dubrovnik return, Ljeto 2026', 8200.00, '2026-02-01', 'paid'),
      (1, 4, 'other', 'SafeTrip osiguranje za 85 putnika, Ljeto 2026', 4250.00, '2026-02-10', 'paid'),
      (1, null, 'marketing', 'Google Ads kampanja - ljetna destinacija Dubrovnik', 5800.00, '2026-02-15', 'paid'),
      (1, 8, 'accommodation', 'Antalija Luxury Resort - 50 noćenja grupna cijena', 42000.00, '2026-03-01', 'pending'),
      (1, 7, 'transport', 'Turkish Airlines grupni letovi Sarajevo-Antalija x20', 18400.00, '2026-03-05', 'pending'),
      (1, null, 'operations', 'Plaće osoblja - Mart 2026', 12500.00, '2026-03-31', 'paid'),
      (1, null, 'marketing', 'Instagram i Facebook kampanja - Proljeće 2026', 3200.00, '2026-04-01', 'paid'),
      (2, 5, 'accommodation', 'Istanbul Comfort Hotel - Decembar 2025', 9800.00, '2025-12-01', 'paid'),
      (2, 9, 'transport', 'Autobus BiH-Turska decembar 2025', 5600.00, '2025-12-05', 'paid'),
      (3, 6, 'accommodation', 'Hotel Colosseum Roma - April-Maj 2026', 15600.00, '2026-03-20', 'pending'),
      (3, null, 'marketing', 'Reklamni letak i dizajn - Proljeće 2026', 2100.00, '2026-03-25', 'paid')`);
    console.log('✅ Rashodi uneseni');

    // REVENUES
    await db.query(`INSERT INTO revenues (budget_id, booking_id, customer_id, amount, payment_method, payment_date, revenue_type) VALUES
      (1, 1, 1, 3700.00, 'bank_transfer', '2026-01-12', 'booking'),
      (1, 2, 2, 4200.00, 'card', '2026-02-07', 'booking'),
      (1, 3, 3, 7200.00, 'bank_transfer', '2026-02-22', 'booking'),
      (1, 4, 5, 11400.00, 'bank_transfer', '2026-03-03', 'booking'),
      (1, 5, 4, 1560.00, 'cash', '2026-03-12', 'booking'),
      (1, 6, 7, 3300.00, 'card', '2026-03-17', 'booking'),
      (1, 8, 8, 9600.00, 'bank_transfer', '2026-04-07', 'booking'),
      (1, null, 3, 850.00, 'bank_transfer', '2026-04-10', 'service_fee'),
      (1, null, 1, 1200.00, 'card', '2026-04-15', 'service_fee'),
      (1, null, 5, 2400.00, 'bank_transfer', '2026-04-20', 'service_fee'),
      (1, null, 8, 580.00, 'card', '2026-04-22', 'insurance'),
      (1, null, 3, 960.00, 'bank_transfer', '2026-04-25', 'insurance'),
      (1, null, 5, 1800.00, 'bank_transfer', '2026-05-01', 'other'),
      (2, null, 5, 320.00, 'card', '2025-12-20', 'insurance'),
      (2, null, 1, 15800.00, 'bank_transfer', '2025-12-05', 'booking'),
      (2, null, 3, 9200.00, 'bank_transfer', '2025-11-28', 'booking'),
      (2, null, 7, 6400.00, 'card', '2025-12-10', 'booking'),
      (2, null, 2, 4100.00, 'cash', '2025-12-18', 'booking'),
      (3, 7, 6, 1360.00, 'cash', '2026-04-03', 'booking'),
      (3, null, 4, 2400.00, 'bank_transfer', '2026-04-08', 'booking'),
      (3, null, 6, 3600.00, 'card', '2026-04-12', 'booking'),
      (3, null, 1, 1800.00, 'bank_transfer', '2026-04-18', 'booking'),
      (3, null, 2, 4200.00, 'card', '2026-04-25', 'booking')`);
    console.log('✅ Prihodi uneseni');
    console.log('✅ Prihodi uneseni');

    // COST ALLOCATIONS
    await db.query(`INSERT INTO cost_allocations (branch_name, expense_id, allocated_amount, allocation_percentage, period) VALUES
      ('Sarajevo - Centar', 1, 14250.00, 50.00, 'Ljeto 2026'),
      ('Mostar - Podružnica', 1, 8550.00, 30.00, 'Ljeto 2026'),
      ('Banja Luka - Podružnica', 1, 5700.00, 20.00, 'Ljeto 2026'),
      ('Sarajevo - Centar', 7, 8750.00, 70.00, 'Mart 2026'),
      ('Mostar - Podružnica', 7, 2500.00, 20.00, 'Mart 2026'),
      ('Banja Luka - Podružnica', 7, 1250.00, 10.00, 'Mart 2026')`);
    console.log('✅ Alokacije unesene');

    // SERVICE LEVELS
    await db.query(`INSERT INTO service_levels (id, tier_name, response_time_minutes, change_policy_hours, support_availability, includes_insurance, includes_wifi, includes_medical_support, price_modifier, description, is_active) VALUES
      (1, 'standard', 120, 72, 'radni_dani_9_17', false, false, false, 0.00, 'Standardna korisnička podrška u poslovnim satima.', true),
      (2, 'premium', 30, 24, '24/7', true, true, false, 0.15, 'Prioritetna podrška 24/7, osiguranje uključeno, brži odziv.', true),
      (3, 'platinum', 15, 12, '24/7', true, true, true, 0.28, 'Ultimativni nivo - VIP podrška, medicinska asistencija, WiFi.', true),
      (4, 'korporativni', 20, 6, '24/7', true, true, true, 0.20, 'Posebni uslovi za poslovne klijente - SLA garancije i dedikovani menadžer.', true)`);
    console.log('✅ Nivoi usluga uneseni');

    // SLA CONTRACTS
    await db.query(`INSERT INTO sla_contracts (id, contract_number, customer_id, booking_id, service_level_id, start_date, end_date, status, agreed_response_time, agreed_availability, digital_signature, terms, signed_at) VALUES
      (1, 'SLA-2026-001', 1, 1, 2, '2026-01-12', '2026-12-31', 'active', 30, '99.5%', 'TP-SIG-20260112-001', 'Hotel i prevoznik moraju ispuniti dogovorene standarde. Penali za krsenje SLA iznose 5% od vrijednosti aranžmana po incidentu.', '2026-01-12 10:30:00'),
      (2, 'SLA-2026-002', 3, 3, 4, '2026-02-22', '2026-12-31', 'active', 20, '99.9%', 'TP-SIG-20260222-002', 'Korporativni SLA - posebni uslovi za GlobalTech. Garantovana dostupnost menadžera 24/7. Penali 10% per incident.', '2026-02-22 14:00:00'),
      (3, 'SLA-2026-003', 5, 4, 4, '2026-03-03', '2026-12-31', 'active', 20, '99.9%', 'TP-SIG-20260303-003', 'BBG korporativni SLA platinum uslovi. Medicinska asistencija uključena. Otkazivanje bez penala 48h unaprijed.', '2026-03-03 09:15:00'),
      (4, 'SLA-2026-004', 2, 2, 1, '2026-02-07', '2026-08-31', 'active', 60, '99%', 'TP-SIG-20260207-004', 'Standardni SLA za Antalija aranžman. Reklamacije u roku od 48h od povratka.', '2026-02-07 11:00:00'),
      (5, 'SLA-2025-012', 4, 5, 1, '2025-12-01', '2026-01-31', 'completed', 120, '99%', 'TP-SIG-20251201-012', 'Standardni SLA za Istanbul city break - završen bez incidenata.', '2025-12-01 08:00:00')`);
    console.log('✅ SLA Ugovori uneseni');

    // SERVICE REQUIREMENTS
    await db.query(`INSERT INTO service_requirements (requirement_title, destination_id, requested_by, description, priority, status, estimated_cost, feasibility, evaluation_notes) VALUES
      ('Vegetariansi meni na svim aranžmanima', 4, 'Amra Delić', 'Klijentica zahtijeva vegetarijansku opciju na svim paket-aranžmanima u Antaliji.', 'medium', 'approved', 0.00, 'feasible', 'Hotel potvrđuje vegetarijansku opciju u potpunosti.'),
      ('Poseban transfer za invalide - Rim', 3, 'Menadžer prodaje', 'Klijent sa invaliditetom zahtijeva poseban vozilo i asistenciju u Rimu.', 'high', 'implementing', 350.00, 'feasible', 'Dogovoreno sa partnerom u Rimu - vozilo prilagođeno.'),
      ('VIP lounge Sarajevo aerodrom', 8, 'GlobalTech d.o.o.', 'Korporativni klijent zahtijeva VIP lounge usluge pri polasku.', 'high', 'evaluating', 800.00, 'needs_review', 'U toku pregovori sa aerodromom Sarajevo.'),
      ('Dječji animatori na Antalija paketu', 4, 'Lejla Hadžić', 'Porodični paket zahtijeva organizovane aktivnosti za djecu u resortu.', 'low', 'submitted', 200.00, 'feasible', ''),
      ('24/7 helpline na bosanskom', 1, 'klijent', 'Klijenti zahtijevaju podršku na maternjem jeziku van radnog vremena.', 'critical', 'approved', 5000.00, 'feasible', 'Implementirano - aktiviran outsourcing call centra.')`);
    console.log('✅ Zahtjevi za uslugom uneseni');

    // SERVICE INCIDENTS
    await db.query(`INSERT INTO service_incidents (incident_number, booking_id, sla_contract_id, incident_type, severity, description, response_time_minutes, resolved_at, resolution_notes, status, sla_met) VALUES
      ('INC-2026-001', 3, 2, 'accommodation_issue', 'high', 'Hotel nije imao rezervisanu sobu za korporativni tim GlobalTech. Klijenti čekali 3 sata.', 180, '2026-03-16 18:00:00', 'Prebačeni u hotel iste kategorije - klijent naknadna kompenzacija 10% rabata.', 'resolved', false),
      ('INC-2026-002', 2, 4, 'flight_delay', 'medium', 'Let Turkish Airlines zakasnjio 4 sata iz Sarajeva. Putnici bez informacija na aerodromu.', 45, '2026-08-04 14:00:00', 'Osigurani osvježeni i smještaj na aerodromu - klijent zadovoljan rješenjem.', 'resolved', true),
      ('INC-2026-003', 1, 1, 'other', 'low', 'WiFi u hotelu Azure nije funkcionisao prvog dana boravka.', 60, null, 'U toku - hotel primio prijavu, tehničar angažovan.', 'in_progress', true),
      ('INC-2026-004', 4, 3, 'document_issue', 'critical', 'Jedan član BBG delegacije nije imao vizu za Italiju - nije mogao putovati.', 30, '2026-06-22 09:00:00', 'Refundiran udio troška za tog putnika. Procedura provjere dokumenata unaprijeđena.', 'closed', true),
      ('INC-2026-005', 6, null, 'accommodation_issue', 'medium', 'Soba u Parizu nije bila čista pri dolasku klijenata - neprihvatljivo stanje.', 25, null, '', 'open', true)`);
    console.log('✅ Incidenti uneseni');

    // SERVICE METRICS
    const metricsData = [
      ['2026-04-01', 1, 1, 'customer_satisfaction', 92, 90, 'score', 'Ocjena zadovoljstva klijenata Hotel Azure - April'],
      ['2026-04-01', 3, 3, 'customer_satisfaction', 88, 90, 'score', 'Ocjena zadovoljstva - Hotel Colosseum Roma'],
      ['2026-04-01', 8, 4, 'customer_satisfaction', 96, 90, 'score', 'Antalija Luxury Resort - izvrsna ocjena gostiju'],
      ['2026-04-15', 1, 1, 'response_time', 28, 30, 'minutes', 'Prosječno vrijeme odziva Hotel Azure'],
      ['2026-04-15', 3, 3, 'response_time', 45, 30, 'minutes', 'Roma hotel - odziv iznad norme!'],
      ['2026-04-15', 8, 4, 'response_time', 18, 30, 'minutes', 'Antalija resort - odlično vrijeme odziva'],
      ['2026-05-01', 1, 1, 'sla_compliance', 97, 95, 'percentage', 'SLA usklađenost Hotel Azure'],
      ['2026-05-01', 3, 3, 'sla_compliance', 89, 95, 'percentage', 'Roma partner - krsenje SLA u April!'],
      ['2026-05-01', 8, 4, 'sla_compliance', 99, 95, 'percentage', 'Antalija - skoro savršena usklađenost'],
      ['2026-05-01', 2, 1, 'incident_rate', 1, 5, 'count', 'AdriaFly - broj incidenata u maju'],
      ['2026-05-01', 7, 4, 'incident_rate', 0, 5, 'count', 'Turkish Airlines - nula incidenata!'],
      ['2026-04-01', 1, 1, 'customer_satisfaction', 90, 90, 'score', 'Mart ocjena - Hotel Azure'],
      ['2026-03-01', 1, 1, 'sla_compliance', 95, 95, 'percentage', 'Mart SLA compliance'],
      ['2026-02-01', 1, 1, 'sla_compliance', 93, 95, 'percentage', 'Februar SLA compliance'],
    ];
    for (const m of metricsData) {
      await db.query('INSERT INTO service_metrics (metric_date, supplier_id, destination_id, metric_type, metric_value, target_value, unit, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', m);
    }
    console.log('✅ Metrike unesene');

    // OLA AGREEMENTS
    await db.query(`INSERT INTO ola_agreements (agreement_number, service_owner, description, agreed_metrics, start_date, end_date, status) VALUES
      ('OLA-2026-001', 'IT Tim - Infrastruktura', 'Operativni sporazum između IT tima i odjela korisničke podrške. Reguliše dostupnost internih sistema, helpdesk odziv i eskalacijske procedure.', '{"response_time":"30 min","availability":"99.5%","resolution_time":"4h","escalation_time":"1h"}', '2026-01-01', '2026-12-31', 'active'),
      ('OLA-2026-002', 'Odjel Logistike', 'Sporazum između logistike i prodajnog tima o pravovremenoj koordinaciji transfera, smještaja i dokumentacije za grupna putovanja.', '{"response_time":"2h","availability":"95%","resolution_time":"24h","escalation_time":"4h"}', '2026-01-01', '2026-12-31', 'active'),
      ('OLA-2026-003', 'Finansijski Odjel', 'Interni OLA između finansijskog odjela i menadžmenta za obradu faktura, isplata i finansijskog izvještavanja u dogovorenim rokovima.', '{"response_time":"1 radni dan","availability":"99%","resolution_time":"3 radna dana","escalation_time":"2h"}', '2026-01-01', '2026-12-31', 'active'),
      ('OLA-2025-008', 'Call Centar - Podrška', 'Sporazum call centra za zimsku sezonu 2025. Pokriva 24/7 podršku na bosanskom, engleskom i turskom jeziku za korisnike van radnog vremena.', '{"response_time":"5 min","availability":"99.9%","resolution_time":"1h","escalation_time":"15 min"}', '2025-10-01', '2026-03-31', 'expired'),
      ('OLA-2026-004', 'Partnerski Odnosi', 'Operativni sporazum za upravljanje odnosima sa hotelskim i aviokompanijskim partnerima - rokovi odgovora, pregovori, reklamacije.', '{"response_time":"4h","availability":"98%","resolution_time":"48h","escalation_time":"8h"}', '2026-03-01', '2026-12-31', 'active')`);
    console.log('✅ OLA sporazumi uneseni');

    // VENDOR INVOICES
    await db.query(`INSERT INTO vendor_invoices (supplier_id, invoice_number, invoice_date, due_date, amount, description, status) VALUES
      (1, 'AZUR-2026-041', '2026-01-15', '2026-02-15', 28500.00, 'Hotel Azure Dubrovnik - rezervacija 30 noćenja Ljeto 2026', 'paid'),
      (8, 'ANT-2026-078', '2026-03-01', '2026-04-01', 42000.00, 'Antalija Luxury Resort - grupska rezervacija 50 noćenja', 'unpaid'),
      (7, 'TK-2026-122', '2026-03-05', '2026-03-25', 18400.00, 'Turkish Airlines - grupski letovi Sarajevo-Antalija 20 pax', 'unpaid'),
      (6, 'COL-2026-055', '2026-03-20', '2026-04-20', 15600.00, 'Hotel Colosseum Roma - April-Maj 2026', 'unpaid'),
      (4, 'ST-2026-033', '2026-02-10', '2026-03-01', 4250.00, 'SafeTrip osiguranje 85 putnika Ljeto 2026', 'paid'),
      (9, 'BUS-2026-019', '2026-02-01', '2026-03-01', 8200.00, 'AutoBus Sarajevo-Dubrovnik return, sezona 2026', 'paid')
    `).catch(e => console.log('Vendor invoices skipped:', e.message));
    console.log('✅ Vendor fakture unesene');

    console.log('\n🎉 Seed uspješno završen! Baza je popunjena realnim podacima za TravelPlus.\n');

  } catch (err) {
    console.error('❌ Greška pri seeding:', err.message);
    throw err;
  } finally {
    await db.end();
  }
}

seed().catch(console.error);
