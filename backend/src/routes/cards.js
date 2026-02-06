import { Router } from 'express';
import {
  listCards,
  getCard,
  createCard,
  updateCard,
  deleteCard,
  refreshCardFromMilesopedia,
} from '../services/cardService.js';

export const cardsRouter = Router();

cardsRouter.get('/', async (req, res) => {
  try {
    if (req.session.role === 'superadmin') {
      return res.json([]);
    }
    const cards = await listCards(req.session.userId);
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

cardsRouter.get('/:id', async (req, res) => {
  try {
    if (req.session.role === 'superadmin') {
      return res.status(403).json({ error: 'Superadmin cannot manage personal cards' });
    }
    const card = await getCard(req.params.id, req.session.userId);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

cardsRouter.post('/', async (req, res) => {
  try {
    if (req.session.role === 'superadmin') {
      return res.status(403).json({ error: 'Superadmin cannot manage personal cards' });
    }
    const card = await createCard(req.body, req.session.userId);
    res.status(201).json(card);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

cardsRouter.put('/:id', async (req, res) => {
  try {
    if (req.session.role === 'superadmin') {
      return res.status(403).json({ error: 'Superadmin cannot manage personal cards' });
    }
    const card = await updateCard(req.params.id, req.body, req.session.userId);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.json(card);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

cardsRouter.delete('/:id', async (req, res) => {
  try {
    if (req.session.role === 'superadmin') {
      return res.status(403).json({ error: 'Superadmin cannot manage personal cards' });
    }
    const deleted = await deleteCard(req.params.id, req.session.userId);
    if (!deleted) return res.status(404).json({ error: 'Card not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

cardsRouter.post('/:id/refresh-from-milesopedia', async (req, res) => {
  try {
    if (req.session.role === 'superadmin') {
      return res.status(403).json({ error: 'Superadmin cannot manage personal cards' });
    }
    const card = await refreshCardFromMilesopedia(req.params.id, req.session.userId);
    res.json(card);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    if (err.name === 'NotFoundError') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});
