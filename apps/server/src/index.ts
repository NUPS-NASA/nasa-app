import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import prisma from './prismaClient.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', async (_, res) => {
  const logs = await prisma.missionLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  res.json({
    message: 'Hello World!',
    missionLogs: logs,
  });
});

app.get('/health/db', async (_, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: error instanceof Error ? error.message : error });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API listening on ${PORT}`));

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
