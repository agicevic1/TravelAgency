import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const results = await query(`
      SELECT b.*, c.name as customer_name, p.name as product_name
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN products p ON b.product_id = p.id
      ORDER BY b.booking_date DESC
    `);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const results = await query(`
      SELECT b.*, c.name as customer_name, p.name as product_name
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN products p ON b.product_id = p.id
      WHERE b.id = ?
    `, [req.params.id]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { booking_number, customer_id, product_id, booking_date, travel_date, status, total_price, cost_price, net_profit, number_of_travelers, notes } = req.body;
  try {
    const results = await query(
      `INSERT INTO bookings (booking_number, customer_id, product_id, booking_date, travel_date, status, total_price, cost_price, net_profit, number_of_travelers, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [booking_number, customer_id, product_id, booking_date, travel_date, status || 'pending', total_price, cost_price, net_profit, number_of_travelers || 1, notes]
    );
    res.status(201).json({ id: results.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { booking_number, customer_id, product_id, booking_date, travel_date, status, total_price, cost_price, net_profit, number_of_travelers, notes } = req.body;
  try {
    await query(
      `UPDATE bookings SET booking_number = ?, customer_id = ?, product_id = ?, booking_date = ?, travel_date = ?, status = ?, total_price = ?, cost_price = ?, net_profit = ?, number_of_travelers = ?, notes = ? WHERE id = ?`,
      [booking_number, customer_id, product_id, booking_date, travel_date, status, total_price, cost_price, net_profit, number_of_travelers, notes, req.params.id]
    );
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
