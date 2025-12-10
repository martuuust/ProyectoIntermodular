import { Router } from 'express';
import { getAllCamps } from '../services/camps.service.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const camps = await getAllCamps();
    res.json(camps);
  } catch (error) {
    console.error('Error al obtener camps', error);
    res.status(500).json({ error: 'Error al obtener camps' });
  }
});

export default router;



