import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const results = await query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const results = await query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { name, email, phone, customer_type, service_tier } = req.body;
  try {
    const results = await query(
      'INSERT INTO customers (name, email, phone, customer_type, service_tier) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, customer_type || 'individual', service_tier || 'standard']
    );
    res.status(201).json({ id: results.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name, email, phone, customer_type, service_tier } = req.body;
  try {
    await query(
      'UPDATE customers SET name = ?, email = ?, phone = ?, customer_type = ?, service_tier = ? WHERE id = ?',
      [name, email, phone, customer_type, service_tier, req.params.id]
    );
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
