import express from 'express';

const router = express.Router();

const users = [
  { username: 'admin', password: 'admin1234', role: 'admin', name: 'Administrator' },
  { username: 'finance', password: 'finance1234', role: 'finance', name: 'Menadžment za finansije' },
];

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Pogrešan username ili password.' });
  }

  res.json({
    token: Buffer.from(`${user.username}:${user.role}`).toString('base64'),
    user: { username: user.username, role: user.role, name: user.name },
  });
});

router.post('/logout', (_req, res) => {
  res.json({ message: 'Uspješno ste odjavljeni.' });
});

export default router;
