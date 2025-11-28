import type { NextApiRequest, NextApiResponse } from 'next';
import Pusher from 'pusher';
import admin from 'firebase-admin';

// initialize firebase-admin (use service account in env)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FB_PROJECT_ID,
      clientEmail: process.env.FB_CLIENT_EMAIL,
      privateKey: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // verify firebase id token from Authorization header or cookie
  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.replace('Bearer ', '');
  if (!idToken) return res.status(401).json({ error: 'Missing token' });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const userRecord = await admin.auth().getUser(uid);

    const socketId = req.body.socket_id || req.query.socket_id;
    const channel = req.body.channel_name || req.query.channel_name;

    if (!socketId || !channel) return res.status(400).json({ error: 'Missing params' });

    // For presence channels, provide user_data object
    if (channel.startsWith('presence-')) {
      const presenceData = {
        user_id: uid,
        user_info: {
          name: userRecord.displayName || userRecord.email,
          role: (userRecord.customClaims && userRecord.customClaims.role) || 'mentee'
        }
      };
      const auth = pusher.authorizeChannel(socketId, channel, presenceData);
      return res.status(200).send(auth);
    } else {
      const auth = pusher.authorizeChannel(socketId, channel);
      return res.status(200).send(auth);
    }
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

