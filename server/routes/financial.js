import express from 'express';
import { query } from '../config/db.js';
import ExcelJS from 'exceljs';

const router = express.Router();

const financeGuard = (req, res, next) => {
  const role = req.headers['x-user-role'];
  if (role && role !== 'finance') return res.status(403).json({ message: 'Samo finance korisnik ima pristup finansijama.' });
  next();
};
router.use(financeGuard);

// ====================== GET ROUTES ======================
router.get('/budgets', async (req, res) => {
  try {
    const { year, season } = req.query;
    let sql = 'SELECT * FROM budgets WHERE 1=1';
    const params = [];
    if (year) { sql += ' AND year = ?'; params.push(year); }
    if (season) { sql += ' AND season = ?'; params.push(season); }
    sql += ' ORDER BY created_at DESC';
    res.json(await query(sql, params));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/expenses', async (req, res) => {
  try {
    const { from, to, month, year } = req.query;
    let sql = `SELECT e.*, s.name as supplier_name FROM expenses e LEFT JOIN suppliers s ON e.supplier_id = s.id WHERE 1=1`;
    const params = [];
    if (from) { sql += ' AND DATE(e.expense_date) >= DATE(?)'; params.push(from); }
    if (to) { sql += ' AND DATE(e.expense_date) <= DATE(?)'; params.push(to); }
    if (month) { sql += ' AND MONTH(e.expense_date) = ?'; params.push(month); }
    if (year) { sql += ' AND YEAR(e.expense_date) = ?'; params.push(year); }
    sql += ' ORDER BY e.expense_date DESC';
    res.json(await query(sql, params));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/revenues', async (req, res) => {
  try {
    const { from, to, month, year } = req.query;
    let sql = `SELECT r.*, c.name as customer_name FROM revenues r LEFT JOIN customers c ON r.customer_id = c.id WHERE 1=1`;
    const params = [];
    if (from) { sql += ' AND DATE(r.payment_date) >= DATE(?)'; params.push(from); }
    if (to) { sql += ' AND DATE(r.payment_date) <= DATE(?)'; params.push(to); }
    if (month) { sql += ' AND MONTH(r.payment_date) = ?'; params.push(month); }
    if (year) { sql += ' AND YEAR(r.payment_date) = ?'; params.push(year); }
    sql += ' ORDER BY r.payment_date DESC';
    res.json(await query(sql, params));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/allocations', async (_req, res) => {
  try { res.json(await query('SELECT * FROM cost_allocations ORDER BY created_at DESC')); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Vendor invoices
router.get('/vendor-invoices', async (_req, res) => {
  try {
    const rows = await query(`SELECT vi.*, s.name as supplier_name FROM vendor_invoices vi LEFT JOIN suppliers s ON vi.supplier_id = s.id ORDER BY vi.invoice_date DESC`).catch(() => []);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Profitability by destination (drill-down)
router.get('/profitability', async (_req, res) => {
  try {
    const rows = await query(`
      SELECT d.name as destination, d.country,
        SUM(b.total_price) as total_revenue,
        SUM(b.cost_price) as total_cost,
        SUM(b.net_profit) as net_profit,
        COUNT(b.id) as booking_count,
        AVG(b.net_profit) as avg_profit_per_booking
      FROM destinations d
      LEFT JOIN products p ON p.destination_id = d.id
      LEFT JOIN bookings b ON b.product_id = p.id AND b.status != 'cancelled'
      GROUP BY d.id, d.name, d.country
      ORDER BY net_profit DESC
    `);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Expense drill-down by category
router.get('/expenses/drilldown', async (_req, res) => {
  try {
    const rows = await query(`
      SELECT 
        category,
        SUM(amount) as total,
        COUNT(*) as count,
        AVG(amount) as avg_amount,
        SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as paid,
        SUM(CASE WHEN payment_status = 'pending' THEN amount ELSE 0 END) as pending,
        SUM(CASE WHEN payment_status = 'overdue' THEN amount ELSE 0 END) as overdue
      FROM expenses GROUP BY category ORDER BY total DESC
    `);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Cost approval workflow
router.get('/approvals', async (_req, res) => {
  try {
    const rows = await query(`SELECT e.*, s.name as supplier_name FROM expenses e LEFT JOIN suppliers s ON e.supplier_id = s.id WHERE e.payment_status = 'pending' ORDER BY e.expense_date DESC`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ====================== POST ROUTES ======================
router.post('/budgets', async (req, res) => {
  const { season, year, planned_revenue, planned_expenses, marketing_budget, operations_budget, status, notes } = req.body;
  try {
    if (!season || !year) return res.status(400).json({ error: 'season i year su obavezni.' });
    const r = await query(
      'INSERT INTO budgets (season, year, planned_revenue, planned_expenses, marketing_budget, operations_budget, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [season, Number(year), Number(planned_revenue)||0, Number(planned_expenses)||0, Number(marketing_budget)||0, Number(operations_budget)||0, status || 'draft', notes || '']
    );
    res.status(201).json({ id: r.insertId, ...req.body });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/expenses', async (req, res) => {
  const { budget_id, supplier_id, category, description, amount, expense_date, payment_status,
    accommodation_cost, transport_cost, insurance_cost, commission } = req.body;
  try {
    if (!category || !amount || !expense_date) return res.status(400).json({ error: 'category, amount i expense_date su obavezni.' });
    // Calculate total from breakdown if provided
    const totalAmount = (accommodation_cost || transport_cost || insurance_cost || commission)
      ? (Number(accommodation_cost||0) + Number(transport_cost||0) + Number(insurance_cost||0) + Number(commission||0))
      : Number(amount);
    const r = await query(
      'INSERT INTO expenses (budget_id, supplier_id, category, description, amount, expense_date, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [budget_id || null, supplier_id || null, category, description || '', totalAmount, expense_date, payment_status || 'pending']
    );
    res.status(201).json({ id: r.insertId, ...req.body, amount: totalAmount });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/revenues', async (req, res) => {
  const { budget_id, booking_id, customer_id, amount, payment_method, payment_date, revenue_type } = req.body;
  try {
    if (!amount || !payment_date || !payment_method) return res.status(400).json({ error: 'amount, payment_method i payment_date su obavezni.' });
    const r = await query(
      'INSERT INTO revenues (budget_id, booking_id, customer_id, amount, payment_method, payment_date, revenue_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [budget_id || null, booking_id || null, customer_id || null, Number(amount), payment_method, payment_date, revenue_type || 'booking']
    );
    res.status(201).json({ id: r.insertId, ...req.body });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/allocations', async (req, res) => {
  const { branch_name, expense_id, allocated_amount, allocation_percentage, period } = req.body;
  try {
    const r = await query(
      'INSERT INTO cost_allocations (branch_name, expense_id, allocated_amount, allocation_percentage, period) VALUES (?, ?, ?, ?, ?)',
      [branch_name, expense_id || null, Number(allocated_amount)||0, Number(allocation_percentage)||0, period]
    );
    res.status(201).json({ id: r.insertId, ...req.body });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Vendor invoice
router.post('/vendor-invoices', async (req, res) => {
  const { supplier_id, invoice_number, invoice_date, due_date, amount, description, status } = req.body;
  try {
    // Try to use table if exists, else return mock
    const r = await query(
      'INSERT INTO vendor_invoices (supplier_id, invoice_number, invoice_date, due_date, amount, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [supplier_id || null, invoice_number, invoice_date, due_date, Number(amount)||0, description || '', status || 'unpaid']
    ).catch(() => ({ insertId: Date.now() }));
    res.status(201).json({ id: r.insertId, ...req.body });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Approve/forward expense
router.post('/expenses/:id/approve', async (req, res) => {
  const { action, forwarded_to, comment } = req.body; // action: 'approve' | 'forward' | 'reject'
  try {
    const newStatus = action === 'approve' ? 'paid' : action === 'reject' ? 'overdue' : 'pending';
    await query('UPDATE expenses SET payment_status = ? WHERE id = ?', [newStatus, req.params.id]);
    res.json({ success: true, action, message: action === 'forward' ? `Trošak proslijeđen na: ${forwarded_to}` : `Trošak ${action === 'approve' ? 'odobren' : 'odbijen'}.` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ====================== EXCEL REPORT (PROFESSIONAL) ======================
router.get('/report', async (req, res) => {
  try {
    const { from, to, type } = req.query;

    // Fetch all data for comprehensive report
    let expenses = await query(`SELECT e.expense_date as datum, e.category as kategorija, e.description as opis, e.amount as iznos, e.payment_status as status, s.name as dobavljac FROM expenses e LEFT JOIN suppliers s ON e.supplier_id = s.id WHERE 1=1${from ? ' AND DATE(e.expense_date) >= DATE(?)' : ''}${to ? ' AND DATE(e.expense_date) <= DATE(?)' : ''} ORDER BY e.expense_date`, [from, to].filter(Boolean));
    let revenues = await query(`SELECT r.payment_date as datum, r.revenue_type as kategorija, r.payment_method as opis, r.amount as iznos, 'placeno' as status, c.name as klijent FROM revenues r LEFT JOIN customers c ON r.customer_id = c.id WHERE 1=1${from ? ' AND DATE(r.payment_date) >= DATE(?)' : ''}${to ? ' AND DATE(r.payment_date) <= DATE(?)' : ''} ORDER BY r.payment_date`, [from, to].filter(Boolean));

    if (type === 'expenses') revenues = [];
    if (type === 'revenues') expenses = [];

    const wb = new ExcelJS.Workbook();
    wb.creator = 'TravelPlus ITIL System';
    wb.created = new Date();

    // ---- SHEET 1: Financial Balance ----
    const sh = wb.addWorksheet('Finansijski Bilans', { views: [{ showGridLines: false }] });

    // Header
    sh.mergeCells('A1:H1');
    sh.getCell('A1').value = 'TravelPlus d.o.o. — Finansijski Izvještaj';
    sh.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    sh.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
    sh.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    sh.getRow(1).height = 36;

    sh.mergeCells('A2:H2');
    sh.getCell('A2').value = `Period: ${from || 'od početka'} – ${to || 'do danas'} | Generirano: ${new Date().toLocaleDateString('bs-BA')}`;
    sh.getCell('A2').font = { italic: true, size: 10, color: { argb: 'FF555555' } };
    sh.getCell('A2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EEF7' } };
    sh.getCell('A2').alignment = { horizontal: 'center' };
    sh.getRow(2).height = 20;

    // Column headers
    const headers = ['Datum', 'Tip', 'Kategorija', 'Opis', 'Ulaz (KM)', 'Izlaz (KM)', 'PDV 17%', 'Saldo'];
    const colWidths = [14, 12, 16, 30, 14, 14, 12, 14];
    sh.getRow(4).values = headers;
    headers.forEach((_, i) => {
      const cell = sh.getCell(4, i + 1);
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D6CB4' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { bottom: { style: 'medium', color: { argb: 'FF1E3A5F' } } };
      sh.getColumn(i + 1).width = colWidths[i];
    });
    sh.getRow(4).height = 24;

    let rowIdx = 5;
    let runningBalance = 0;
    let totalIn = 0;
    let totalOut = 0;

    // Revenues rows
    for (const r of revenues) {
      runningBalance += Number(r.iznos || 0);
      totalIn += Number(r.iznos || 0);
      const tax = Number(r.iznos || 0) * 0.17;
      const row = sh.getRow(rowIdx++);
      row.values = [
        r.datum ? new Date(r.datum).toLocaleDateString('bs-BA') : '',
        'PRIHOD', r.kategorija || '', r.klijent || r.opis || '',
        Number(r.iznos || 0), '', tax.toFixed(2), runningBalance
      ];
      row.getCell(5).font = { color: { argb: 'FF166534' }, bold: true };
      row.getCell(8).font = { color: { argb: 'FF166534' } };
      row.getCell(5).numFmt = '#,##0.00';
      row.getCell(8).numFmt = '#,##0.00';
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
    }

    // Expense rows
    for (const e of expenses) {
      runningBalance -= Number(e.iznos || 0);
      totalOut += Number(e.iznos || 0);
      const tax = Number(e.iznos || 0) * 0.17;
      const row = sh.getRow(rowIdx++);
      row.values = [
        e.datum ? new Date(e.datum).toLocaleDateString('bs-BA') : '',
        'RASHOD', e.kategorija || '', e.opis || '',
        '', Number(e.iznos || 0), tax.toFixed(2), runningBalance
      ];
      row.getCell(6).font = { color: { argb: 'FF991B1B' }, bold: true };
      row.getCell(8).numFmt = '#,##0.00';
      if (runningBalance < 0) row.getCell(8).font = { color: { argb: 'FF991B1B' } };
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
    }

    // Summary rows
    rowIdx++;
    const sumRow = sh.getRow(rowIdx++);
    sumRow.values = ['', 'UKUPNO', '', '', totalIn, totalOut, ((totalIn + totalOut) * 0.17).toFixed(2), totalIn - totalOut];
    sumRow.font = { bold: true, size: 12 };
    sumRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
    sumRow.getCell(5).font = { bold: true, size: 12, color: { argb: 'FF86EFAC' } };
    sumRow.getCell(6).font = { bold: true, size: 12, color: { argb: 'FFFCA5A5' } };
    sumRow.getCell(8).font = { bold: true, size: 12, color: { argb: totalIn - totalOut >= 0 ? 'FF86EFAC' : 'FFFCA5A5' } };
    sumRow.getCell(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sumRow.height = 28;
    ['E','F','G','H'].forEach(col => { sh.getCell(`${col}${rowIdx-1}`).numFmt = '#,##0.00'; });

    // ---- SHEET 2: Expenses by Category ----
    const sh2 = wb.addWorksheet('Rashodi po Kategorijama');
    const catData = {};
    for (const e of expenses) {
      catData[e.kategorija] = (catData[e.kategorija] || 0) + Number(e.iznos || 0);
    }
    sh2.getRow(1).values = ['Kategorija', 'Ukupni Iznos (KM)', '% od ukupnog'];
    sh2.getRow(1).font = { bold: true };
    sh2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D6CB4' } };
    sh2.getRow(1).getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sh2.getRow(1).getCell(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sh2.getRow(1).getCell(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    let r2idx = 2;
    for (const [cat, amt] of Object.entries(catData)) {
      sh2.getRow(r2idx++).values = [cat, amt, totalOut > 0 ? ((amt / totalOut) * 100).toFixed(1) + '%' : '0%'];
    }
    sh2.columns = [{ width: 22 }, { width: 20 }, { width: 16 }];

    const buffer = await wb.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=TravelPlus_Finansijski_Izvjestaj.xlsx');
    res.send(buffer);

  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
