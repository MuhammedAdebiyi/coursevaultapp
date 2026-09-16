import { kv } from '@vercel/kv';

const PASSCODE = '002160';
const DEFAULT_DATE = '2026-10-20T00:00:00';
const KV_KEY = 'cv_launch_target';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const stored = await kv.get(KV_KEY);
      if (stored) {
        return res.status(200).json({ date: stored });
      }
    } catch (e) {
      // KV not configured yet, fall through to default
    }
    return res.status(200).json({ date: DEFAULT_DATE });
  }

  if (req.method === 'POST') {
    const { passcode, date } = req.body || {};

    if (passcode !== PASSCODE) {
      return res.status(401).json({ error: 'Invalid passcode' });
    }

    if (!date || isNaN(new Date(date).getTime())) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    try {
      await kv.set(KV_KEY, date);
      return res.status(200).json({ success: true, date });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to save to database' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
