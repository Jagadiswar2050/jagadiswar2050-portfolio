import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';

const app = express();
const port = Number(process.env.PORT) || 3000;
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'https://jagadiswar2050.github.io';

app.use(cors({ origin: frontendOrigin }));
app.use(express.json({ limit: '10kb' }));

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many messages. Please try again later.' }
});

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'portfolio-contact-api' });
});

app.post('/api/contact', contactLimiter, (request, response) => {
  const { name, email, message } = request.body ?? {};
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim() : '';
  const cleanMessage = typeof message === 'string' ? message.trim() : '';

  if (!cleanName || !cleanEmail || !cleanMessage) {
    return response.status(400).json({ error: 'Name, email, and message are required.' });
  }

  if (cleanName.length > 80 || cleanEmail.length > 160 || cleanMessage.length > 2000) {
    return response.status(400).json({ error: 'One or more fields are too long.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return response.status(400).json({ error: 'Please provide a valid email address.' });
  }

  console.log(JSON.stringify({
    receivedAt: new Date().toISOString(),
    name: cleanName,
    email: cleanEmail,
    message: cleanMessage
  }));

  return response.status(202).json({ message: 'Your message was received.' });
});

app.use((_request, response) => {
  response.status(404).json({ error: 'Not found.' });
});

app.listen(port, () => {
  console.log(`Portfolio API listening on port ${port}`);
});
