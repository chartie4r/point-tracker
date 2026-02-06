import { Router } from 'express';
import {
  listSnapshotsByCard,
  getSnapshot,
  createSnapshot,
  updateSnapshot,
  deleteSnapshot,
} from '../services/snapshotService.js';

export const snapshotsRouter = Router();

function blockSuperadmin(req, res, next) {
  if (req.session.role === 'superadmin') {
    return res.status(403).json({ error: 'Superadmin cannot manage personal cards' });
  }
  next();
}

snapshotsRouter.use(blockSuperadmin);

snapshotsRouter.get('/cards/:cardId/snapshots', async (req, res) => {
  try {
    const { from, to } = req.query;
    const snapshots = await listSnapshotsByCard(req.params.cardId, { from, to }, req.session.userId);
    res.json(snapshots);
  } catch (err) {
    if (err.code === 'NOT_FOUND') return res.status(404).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

snapshotsRouter.post('/cards/:cardId/snapshots', async (req, res) => {
  try {
    const snapshot = await createSnapshot(req.params.cardId, req.body, req.session.userId);
    res.status(201).json(snapshot);
  } catch (err) {
    if (err.code === 'NOT_FOUND') return res.status(404).json({ error: err.message });
    if (err.name === 'ValidationError' || err.code === 'P2002') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

snapshotsRouter.get('/snapshots/:id', async (req, res) => {
  try {
    const snapshot = await getSnapshot(req.params.id, req.session.userId);
    if (!snapshot) return res.status(404).json({ error: 'Snapshot not found' });
    res.json(snapshot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

snapshotsRouter.put('/snapshots/:id', async (req, res) => {
  try {
    const snapshot = await updateSnapshot(req.params.id, req.body, req.session.userId);
    if (!snapshot) return res.status(404).json({ error: 'Snapshot not found' });
    res.json(snapshot);
  } catch (err) {
    if (err.name === 'ValidationError' || err.code === 'P2002') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

snapshotsRouter.delete('/snapshots/:id', async (req, res) => {
  try {
    const deleted = await deleteSnapshot(req.params.id, req.session.userId);
    if (!deleted) return res.status(404).json({ error: 'Snapshot not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
