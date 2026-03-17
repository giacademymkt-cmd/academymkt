// Vercel KV storage for task statuses and custom tasks
let memoryStore = {};

async function getKV() {
  try {
    const { kv } = await import('@vercel/kv');
    return kv;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const kv = await getKV();

  if (req.method === 'GET') {
    try {
      let data;
      if (kv) {
        data = await kv.get('gi-tasks') || {};
      } else {
        data = memoryStore;
      }
      return res.status(200).json({ success: true, data, storage: kv ? 'kv' : 'memory' });
    } catch (e) {
      return res.status(200).json({ success: true, data: memoryStore, storage: 'memory' });
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      
      let data;
      if (kv) {
        data = await kv.get('gi-tasks') || {};
      } else {
        data = memoryStore;
      }

      // Update task status
      if (body.action === 'update_status') {
        if (!data.statuses) data.statuses = {};
        data.statuses[body.taskId] = body.status;
      }

      // Add custom task
      if (body.action === 'add_task') {
        if (!data.customTasks) data.customTasks = [];
        data.customTasks.push({
          id: 'custom_' + Date.now(),
          ...body.task,
          createdAt: new Date().toISOString()
        });
      }

      // Delete custom task
      if (body.action === 'delete_task') {
        if (data.customTasks) {
          data.customTasks = data.customTasks.filter(t => t.id !== body.taskId);
        }
      }

      // Add comment
      if (body.action === 'add_comment') {
        if (!data.comments) data.comments = [];
        data.comments.push({
          id: 'comment_' + Date.now(),
          ...body.comment,
          createdAt: new Date().toISOString()
        });
      }

      // Add content (for Claude to push new briefs)
      if (body.action === 'add_content') {
        if (!data.newContent) data.newContent = [];
        data.newContent.push({
          id: 'content_' + Date.now(),
          ...body.content,
          createdAt: new Date().toISOString()
        });
      }

      if (kv) {
        await kv.set('gi-tasks', data);
      } else {
        memoryStore = data;
      }

      return res.status(200).json({ success: true, data });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
