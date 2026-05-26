/*import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const [totalRevenueResult] = await query('SELECT COALESCE(SUM(amount), 0) as total FROM revenues');
    const [totalExpensesResult] = await query('SELECT COALESCE(SUM(amount), 0) as total FROM expenses');
    const [activeBookingsResult] = await query('SELECT COUNT(*) as count FROM bookings WHERE status IN ("confirmed", "pending")');
    const [totalCustomersResult] = await query('SELECT COUNT(*) as count FROM customers');
    const [openIncidentsResult] = await query('SELECT COUNT(*) as count FROM service_incidents WHERE status IN ("open", "in_progress")');
    const [slaComplianceResult] = await query('SELECT COALESCE(metric_value, 0) as value FROM service_metrics WHERE metric_type = "sla_compliance" ORDER BY metric_date DESC LIMIT 1');

    res.json({
      totalRevenue: parseFloat(totalRevenueResult.total || 0),
      totalExpenses: parseFloat(totalExpensesResult.total || 0),
      activeBookings: activeBookingsResult.count || 0,
      totalCustomers: totalCustomersResult.count || 0,
      openIncidents: openIncidentsResult.count || 0,
      slaCompliance: parseFloat(slaComplianceResult.value || 0),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
*/


import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const revenueRes = await query('SELECT COALESCE(SUM(amount), 0) as total FROM revenues');
    const expensesRes = await query('SELECT COALESCE(SUM(amount), 0) as total FROM expenses');
    const activeRes = await query('SELECT COUNT(*) as count FROM bookings WHERE status IN ("confirmed", "pending")');
    const customersRes = await query('SELECT COUNT(*) as count FROM customers');
    const incidentsRes = await query('SELECT COUNT(*) as count FROM service_incidents WHERE status IN ("open", "in_progress")');
    const slaRes = await query('SELECT COALESCE(metric_value, 0) as value FROM service_metrics WHERE metric_type = "sla_compliance" ORDER BY metric_date DESC LIMIT 1');

    // ISPIS U TERMINAL (Pogledaj VS Code terminal nakon što osvežiš stranu)
    console.log("Revenue iz baze:", revenueRes[0]);
    console.log("Customers iz baze:", customersRes[0]);

    res.json({
      totalRevenue: parseFloat(revenueRes[0]?.total || 0),
      totalExpenses: parseFloat(expensesRes[0]?.total || 0),
      activeBookings: activeRes[0]?.count || 0,
      totalCustomers: customersRes[0]?.count || 0,
      openIncidents: incidentsRes[0]?.count || 0,
      slaCompliance: parseFloat(slaRes[0]?.value || 0),
    });
  } catch (error) {
    console.error("GREŠKA NA DASHBOARDU:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

/*
import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const revenueRes = await query('SELECT COALESCE(SUM(amount), 0) as total FROM revenues');
    const expensesRes = await query('SELECT COALESCE(SUM(amount), 0) as total FROM expenses');
    const bookingsRes = await query('SELECT COUNT(*) as count FROM bookings');

    res.json({
      totalRevenue: parseFloat(revenueRes[0]?.total || 0),
      totalExpenses: parseFloat(expensesRes[0]?.total || 0),
      totalBookings: bookingsRes[0]?.count || 0,
      profit: (revenueRes[0]?.total || 0) - (expensesRes[0]?.total || 0)
    });

  } catch (error) {
    console.error("GREŠKA NA DASHBOARDU:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;*/