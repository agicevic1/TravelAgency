import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

const roleGuard = (req, res, next) => {
  const role = req.headers['x-user-role'];
  if (role && role !== 'admin') return res.status(403).json({ message: 'Samo admin ima pristup SLM modulu.' });
  next();
};

const makeProfessionalPdf = (contract) => {
  const lines = [];
  const s = (t) => String(t ?? '').replace(/[()\\<>]/g, ' ');
  lines.push('q 0.18 0.36 0.71 rg 0 780 595 62 re f Q');
  lines.push('q 1 1 1 rg BT /F2 18 Tf 50 808 Td (TravelPlus d.o.o. - SLA Ugovor) Tj ET Q');
  lines.push('q 0.85 0.9 1 rg BT /F1 10 Tf 50 793 Td (Sporazum o nivou usluge | Service Level Agreement) Tj ET Q');
  lines.push('q 0.18 0.36 0.71 rg 50 772 495 2 re f Q');
  let y = 748;
  const sect = (t) => { lines.push(`q 0.93 0.96 1 rg 50 ${y-4} 495 20 re f Q`); lines.push(`BT /F2 10 Tf 55 ${y+3} Td (${s(t)}) Tj ET`); y -= 26; };
  const row = (t) => { lines.push(`BT /F1 10 Tf 60 ${y} Td (${s(t)}) Tj ET`); y -= 16; };
  sect('1. PODACI O UGOVORU');
  row(`Broj ugovora: ${s(contract.contract_number)}   Status: ${s(contract.status?.toUpperCase())}`);
  row(`Period vaznosti: ${s(contract.start_date)} do ${s(contract.end_date)}   Valjanost: ${s(contract.validity_months || 12)} mj.`);
  row(`Datum potpisa: ${s(contract.signed_at || 'Nije potpisano')}   Dig. potpis: ${s(contract.digital_signature || 'N/A')}`);
  y -= 8;
  sect('2. KLIJENT I USLUGA');
  row(`Klijent: ${s(contract.customer_name || contract.customer_id)}   Nivo usluge: ${s(contract.tier_name)}`);
  row(`Tip usluge: ${s(contract.service_type || 'Turisticki aranžman')}   Odgovorna osoba: ${s(contract.responsible_person || 'Menadžer ugovora')}`);
  row(`Prioritet: ${s((contract.priority || 'medium').toUpperCase())}`);
  y -= 8;
  sect('3. SLA PARAMETRI I GARANCIJE');
  row(`Cilj dostupnosti: ${s(contract.agreed_availability || '99%')}   Maks. odziv: ${s(contract.agreed_response_time || 30)} min`);
  row(`Maks. rješavanje: ${s(contract.max_resolution_time || 240)} min   SLA nivo: ${s(contract.tier_name || '-')}`);
  y -= 8;
  sect('4. KAZNENE ODREDBE (PENALI)');
  row(`${s(contract.penalty_clause || 'Krsenje SLA povlaci umanjenje naknade od 5% po incidentu.')}`);
  row('Eskalacija: Incident se eskalira voditelju odjela u roku od 30 minuta od krsenja.');
  y -= 8;
  sect('5. USLOVI I ODREDBE');
  const terms = s(contract.terms || 'Standardni uslovi TravelPlus d.o.o.').substring(0, 100);
  row(terms);
  row('Izmjene ugovora moraju biti pisanim putem odobrene od obje strane.');
  y -= 8;
  sect('6. POTPISI');
  y -= 10;
  row('Ovlasteni predstavnik TravelPlus:  _________________________');
  row(`Klijent (${s(contract.customer_name)}):  _________________________`);
  lines.push('q 0.7 0.7 0.7 rg 50 42 495 1 re f Q');
  lines.push('BT /F1 8 Tf 50 30 Td (TravelPlus d.o.o. | Sarajevo | +387 33 000-000 | info@travelplus.ba) Tj ET');
  lines.push('BT /F1 8 Tf 50 18 Td (Dokument generisan automatski - pravno valjan uz digitalni potpis) Tj ET');
  const content = lines.join('\n');
  const objs = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj',
    `6 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`,
  ];
  let pdf = '%PDF-1.4\n';
  const off = [0];
  for (const o of objs) { off.push(pdf.length); pdf += `${o}\n`; }
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  off.slice(1).forEach((o) => { pdf += `${String(o).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer << /Root 1 0 R /Size ${objs.length + 1} >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, 'binary');
};

router.use(roleGuard);

router.get('/service-levels', async (_req, res) => {
  try { res.json(await query('SELECT * FROM service_levels ORDER BY tier_name')); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/sla-contracts', async (_req, res) => {
  try {
    res.json(await query(`SELECT s.*, c.name as customer_name, p.name as product_name, sl.tier_name 
      FROM sla_contracts s LEFT JOIN customers c ON s.customer_id = c.id 
      LEFT JOIN bookings b ON s.booking_id = b.id LEFT JOIN products p ON b.product_id = p.id 
      LEFT JOIN service_levels sl ON s.service_level_id = sl.id ORDER BY s.created_at DESC`));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/requirements', async (_req, res) => {
  try { res.json(await query(`SELECT sr.*, d.name as destination_name FROM service_requirements sr LEFT JOIN destinations d ON sr.destination_id = d.id ORDER BY sr.created_at DESC`)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/incidents', async (_req, res) => {
  try { res.json(await query(`SELECT si.*, b.booking_number, c.name as customer_name FROM service_incidents si LEFT JOIN bookings b ON si.booking_id = b.id LEFT JOIN customers c ON b.customer_id = c.id ORDER BY si.reported_at DESC`)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/metrics', async (_req, res) => {
  try { res.json(await query(`SELECT sm.*, s.name as supplier_name, d.name as destination_name FROM service_metrics sm LEFT JOIN suppliers s ON sm.supplier_id = s.id LEFT JOIN destinations d ON sm.destination_id = d.id ORDER BY sm.metric_date DESC`)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/partner-ratings', async (_req, res) => {
  try {
    const rows = await query(`SELECT s.id, s.name as supplier_name, s.type as supplier_type, s.country,
        COALESCE(AVG(sm.metric_value), 0) as avg_quality, COUNT(sm.id) as measurement_count,
        MAX(sm.metric_date) as last_measured
      FROM suppliers s LEFT JOIN service_metrics sm ON sm.supplier_id = s.id
      GROUP BY s.id, s.name, s.type, s.country ORDER BY avg_quality DESC`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/service-levels', async (req, res) => {
  const { tier_name, response_time_minutes, change_policy_hours, support_availability, includes_insurance, includes_wifi, includes_medical_support, price_modifier, description, is_active } = req.body;
  try {
    const r = await query('INSERT INTO service_levels (tier_name, response_time_minutes, change_policy_hours, support_availability, includes_insurance, includes_wifi, includes_medical_support, price_modifier, description, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [tier_name, response_time_minutes, change_policy_hours, support_availability, !!includes_insurance, !!includes_wifi, !!includes_medical_support, price_modifier, description, is_active !== false]);
    res.status(201).json({ id: r.insertId, ...req.body });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/sla-contracts', async (req, res) => {
  const { contract_number, customer_id, booking_id, service_level_id, start_date, end_date, status, agreed_response_time, agreed_availability, digital_signature, terms, signed_at } = req.body;
  try {
    const r = await query('INSERT INTO sla_contracts (contract_number, customer_id, booking_id, service_level_id, start_date, end_date, status, agreed_response_time, agreed_availability, digital_signature, terms, signed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [contract_number, customer_id || null, booking_id || null, service_level_id || null, start_date, end_date, status || 'draft', agreed_response_time, agreed_availability, digital_signature || `TP-${Date.now()}`, terms, signed_at || null]);
    res.status(201).json({ id: r.insertId, ...req.body });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/requirements', async (req, res) => {
  const { requirement_title, destination_id, requested_by, description, priority, status, estimated_cost, feasibility, evaluation_notes } = req.body;
  try {
    const r = await query('INSERT INTO service_requirements (requirement_title, destination_id, requested_by, description, priority, status, estimated_cost, feasibility, evaluation_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [requirement_title, destination_id || null, requested_by, description, priority || 'medium', status || 'submitted', estimated_cost || 0, feasibility || 'needs_review', evaluation_notes]);
    res.status(201).json({ id: r.insertId, ...req.body });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/incidents', async (req, res) => {
  const { incident_number, booking_id, sla_contract_id, incident_type, severity, description, response_time_minutes, resolution_notes, status, sla_met } = req.body;
  try {
    const r = await query('INSERT INTO service_incidents (incident_number, booking_id, sla_contract_id, incident_type, severity, description, response_time_minutes, resolution_notes, status, sla_met) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [incident_number, booking_id || null, sla_contract_id || null, incident_type, severity, description, response_time_minutes, resolution_notes, status || 'open', sla_met !== false]);
    res.status(201).json({ id: r.insertId, ...req.body });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/metrics', async (req, res) => {
  const { metric_date, supplier_id, destination_id, metric_type, metric_value, target_value, unit, notes } = req.body;
  try {
    const r = await query('INSERT INTO service_metrics (metric_date, supplier_id, destination_id, metric_type, metric_value, target_value, unit, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [metric_date, supplier_id || null, destination_id || null, metric_type, metric_value, target_value, unit, notes]);
    res.status(201).json({ id: r.insertId, ...req.body });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Incident escalation endpoint
router.post('/incidents/:id/escalate', async (req, res) => {
  const { department, comment, escalated_by } = req.body;
  try {
    const note = `\n[ESKALACIJA -> ${department}] ${comment || 'Proslijeđeno na rješavanje.'} (${escalated_by || 'agent'} @ ${new Date().toLocaleString('bs-BA')})`;
    await query(`UPDATE service_incidents SET status = 'in_progress', resolution_notes = CONCAT(COALESCE(resolution_notes,''), ?) WHERE id = ?`, [note, req.params.id]);
    res.json({ success: true, department, message: `Incident uspješno proslijeđen na: ${department}` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/requirements/:id', async (req, res) => {
  const { status, feasibility, evaluation_notes } = req.body;
  try { await query('UPDATE service_requirements SET status = ?, feasibility = ?, evaluation_notes = ?, evaluated_at = NOW() WHERE id = ?', [status, feasibility, evaluation_notes, req.params.id]); res.json({ id: req.params.id, ...req.body }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/incidents/:id', async (req, res) => {
  const { status, response_time_minutes, resolution_notes, sla_met } = req.body;
  try { await query('UPDATE service_incidents SET status = ?, response_time_minutes = ?, resolution_notes = ?, sla_met = ?, resolved_at = IF(? IN ("resolved","closed"), NOW(), resolved_at) WHERE id = ?', [status, response_time_minutes, resolution_notes, sla_met !== false, status, req.params.id]); res.json({ id: req.params.id, ...req.body }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/sla-contracts/:id', async (req, res) => {
  const { status, agreed_response_time, agreed_availability } = req.body;
  try { await query('UPDATE sla_contracts SET status = ?, agreed_response_time = ?, agreed_availability = ? WHERE id = ?', [status, agreed_response_time, agreed_availability, req.params.id]); res.json({ id: req.params.id, ...req.body }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// OLA PDF generator
const makeOlaPdf = (ola) => {
  const lines = [];
  const s = (t) => String(t ?? '').replace(/[()\\<>]/g, ' ');
  lines.push('q 0.13 0.45 0.33 rg 0 780 595 62 re f Q');
  lines.push('q 1 1 1 rg BT /F2 18 Tf 50 808 Td (TravelPlus d.o.o. - OLA Sporazum) Tj ET Q');
  lines.push('q 0.7 0.9 0.75 rg BT /F1 10 Tf 50 793 Td (Operativni Sporazum o Nivou Usluge | Operational Level Agreement) Tj ET Q');
  lines.push('q 0.13 0.45 0.33 rg 50 772 495 2 re f Q');
  let y = 748;
  const sect = (t) => { lines.push(`q 0.9 0.97 0.92 rg 50 ${y-4} 495 20 re f Q`); lines.push(`BT /F2 10 Tf 55 ${y+3} Td (${s(t)}) Tj ET`); y -= 26; };
  const row = (t) => { lines.push(`BT /F1 10 Tf 60 ${y} Td (${s(t)}) Tj ET`); y -= 16; };
  sect('1. PODACI O OLA SPORAZUMU');
  row(`Broj sporazuma: ${s(ola.agreement_number)}   Status: ${s(ola.status?.toUpperCase())}`);
  row(`Period vaznosti: ${s(ola.start_date)} do ${s(ola.end_date)}`);
  row(`Vlasnik usluge: ${s(ola.service_owner)}`);
  y -= 8;
  sect('2. OPIS SPORAZUMA');
  const desc = s(ola.description || '').substring(0, 120);
  row(desc);
  y -= 8;
  sect('3. DOGOVORENE METRIKE');
  let metrics = {};
  try { metrics = typeof ola.agreed_metrics === 'string' ? JSON.parse(ola.agreed_metrics) : (ola.agreed_metrics || {}); } catch {}
  if (metrics.response_time) row(`Vrijeme odziva: ${s(metrics.response_time)}`);
  if (metrics.availability) row(`Dostupnost: ${s(metrics.availability)}`);
  if (metrics.resolution_time) row(`Rješavanje: ${s(metrics.resolution_time)}`);
  if (metrics.escalation_time) row(`Eskalacija: ${s(metrics.escalation_time)}`);
  if (!metrics.response_time && !metrics.availability) row('Metrike nisu definirane.');
  y -= 8;
  sect('4. ODGOVORNOSTI');
  row('Interni tim je odgovoran za ispunjavanje dogovorenih operativnih standarda.');
  row('Redovni pregledi sporazuma vrse se kvartalno ili po potrebi.');
  y -= 8;
  sect('5. POTPISI');
  y -= 10;
  row('Ovlasteni predstavnik TravelPlus:  _________________________');
  row(`Vlasnik usluge (${s(ola.service_owner)}):  _________________________`);
  lines.push('q 0.7 0.7 0.7 rg 50 42 495 1 re f Q');
  lines.push('BT /F1 8 Tf 50 30 Td (TravelPlus d.o.o. | Sarajevo | +387 33 000-000 | info@travelplus.ba) Tj ET');
  lines.push('BT /F1 8 Tf 50 18 Td (OLA Dokument generisan automatski - interni sporazum o nivou usluge) Tj ET');
  const content = lines.join('\n');
  const objs = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj',
    `6 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`,
  ];
  let pdf = '%PDF-1.4\n';
  const off = [0];
  for (const o of objs) { off.push(pdf.length); pdf += `${o}\n`; }
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  off.slice(1).forEach((o) => { pdf += `${String(o).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer << /Root 1 0 R /Size ${objs.length + 1} >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, 'binary');
};

// OLA routes
router.get('/ola-agreements', async (_req, res) => {
  try { res.json(await query('SELECT * FROM ola_agreements ORDER BY created_at DESC')); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/ola-agreements', async (req, res) => {
  const { agreement_number, service_owner, description, agreed_metrics, start_date, end_date, status } = req.body;
  try {
    const r = await query(
      'INSERT INTO ola_agreements (agreement_number, service_owner, description, agreed_metrics, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [agreement_number, service_owner, description, JSON.stringify(agreed_metrics || {}), start_date, end_date, status || 'draft']
    );
    res.status(201).json({ id: r.insertId, ...req.body });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/ola-agreements/:id', async (req, res) => {
  const { status, service_owner, description, agreed_metrics } = req.body;
  try {
    await query('UPDATE ola_agreements SET status = ?, service_owner = ?, description = ?, agreed_metrics = ? WHERE id = ?',
      [status, service_owner, description, JSON.stringify(agreed_metrics || {}), req.params.id]);
    res.json({ id: req.params.id, ...req.body });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/ola-agreements/:id/pdf', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM ola_agreements WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'OLA sporazum nije pronađen' });
    const pdf = makeOlaPdf(rows[0]);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${rows[0].agreement_number}.pdf"`);
    res.send(pdf);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/sla-contracts/:id/pdf', async (req, res) => {
  try {
    const rows = await query(`SELECT s.*, c.name as customer_name, sl.tier_name FROM sla_contracts s LEFT JOIN customers c ON s.customer_id = c.id LEFT JOIN service_levels sl ON s.service_level_id = sl.id WHERE s.id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'SLA ugovor nije pronađen' });
    const pdf = makeProfessionalPdf(rows[0]);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${rows[0].contract_number}.pdf"`);
    res.send(pdf);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
