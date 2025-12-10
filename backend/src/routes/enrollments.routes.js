import { Router } from 'express';
import {
  getEnrollmentsByUser,
  createEnrollment,
  deleteEnrollment
} from '../services/enrollments.service.js';

const router = Router();

router.get('/', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id es obligatorio' });
  }

  try {
    const enrollments = await getEnrollmentsByUser(user_id);
    res.json(enrollments);
  } catch (error) {
    console.error('Error al obtener inscripciones', error);
    res.status(500).json({ error: 'Error al obtener inscripciones' });
  }
});

router.post('/', async (req, res) => {
  const { user_id, camp_id, notes, start_date, end_date, form_data } = req.body;

  if (!user_id || !camp_id || !start_date || !end_date) {
    return res.status(400).json({ error: 'user_id, camp_id, start_date y end_date son obligatorios' });
  }

  try {
    const enrollment = await createEnrollment({
      user_id,
      camp_id,
      notes: notes || null,
      start_date,
      end_date,
      form_data: form_data || null
    });
    res.status(201).json(enrollment);
  } catch (error) {
    console.error('Error al crear inscripción', error);
    res.status(500).json({ error: 'Error al crear inscripción' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await deleteEnrollment(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error al borrar inscripción', error);
    res.status(500).json({ error: 'Error al borrar inscripción' });
  }
});

export default router;



