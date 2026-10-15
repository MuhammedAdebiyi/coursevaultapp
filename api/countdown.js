const DEFAULT_DATE = '2026-10-24T12:00:00';
const REPO = 'MuhammedAdebiyi/coursevaultapp';
const FILE_PATH = 'countdown.json';
const PASSCODE = '002160';

async function getFileSha(token) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
    { headers: { Authorization: `token ${token}`, 'User-Agent': 'CourseVault' } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.sha;
}

async function getFromDate() {
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${REPO}/main/${FILE_PATH}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return DEFAULT_DATE;
    const data = await res.json();
    return data.date || DEFAULT_DATE;
  } catch {
    return DEFAULT_DATE;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const date = await getFromDate();
    return res.status(200).json({ date });
  }

  if (req.method === 'POST') {
    const { passcode, date } = req.body || {};
    if (passcode !== PASSCODE) return res.status(401).json({ error: 'Invalid passcode' });
    if (!date || isNaN(new Date(date).getTime())) return res.status(400).json({ error: 'Invalid date' });

    const token = process.env.GITHUB_TOKEN;
    if (!token) return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });

    try {
      const sha = await getFileSha(token);
      const content = Buffer.from(JSON.stringify({ date }, null, 2)).toString('base64');

      const body = {
        message: `Update countdown date to ${date}`,
        content,
      };
      if (sha) body.sha = sha;

      const res2 = await fetch(
        `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `token ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'CourseVault',
          },
          body: JSON.stringify(body),
        }
      );

      if (!res2.ok) {
        const err = await res2.json();
        const detail = err.message || res2.statusText;
        return res.status(500).json({ error: `GitHub API: ${detail}` });
      }

      return res.status(200).json({ success: true, date });
    } catch (e) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
