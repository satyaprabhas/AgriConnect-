import express from 'express';
import db from '../database/db';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roleGuard';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'farmdirect-hub-secret-key-2026';

// Helper to extract user optionally (for unauthenticated feedback submissions)
function getOptionalUser(req: express.Request): any | null {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// 1. Public: Get list of active advisers (for dropdown in feedback forms)
router.get('/advisers', (req, res) => {
  try {
    const advisers = db.prepare(`
      SELECT u.id, u.full_name, u.mobile_number, u.village, u.district, u.state,
             ap.specialization, ap.qualification, ap.experience_years
      FROM users u
      LEFT JOIN adviser_profiles ap ON u.id = ap.user_id
      WHERE u.role = 'ADVISER' AND u.is_active = 1
      ORDER BY u.full_name ASC
    `).all();

    res.json(advisers);
  } catch (err) {
    console.error('Error fetching advisers:', err);
    res.status(500).json({ error: 'Failed to fetch advisers list' });
  }
});

// 2. Public / Authenticated: Submit Feedback (from Login page, Farmer portal, Consumer portal, etc.)
router.post('/', (req, res) => {
  try {
    const optionalUser = getOptionalUser(req);
    const {
      submitter_role,
      submitter_name,
      submitter_contact,
      feedback_type,
      adviser_id,
      rating,
      comments
    } = req.body;

    if (!submitter_name || !submitter_name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!comments || !comments.trim()) {
      return res.status(400).json({ error: 'Comments / feedback message is required' });
    }

    const numRating = rating ? Number(rating) : 5;

    const finalRole = submitter_role || (optionalUser ? optionalUser.role : 'CONSUMER');
    const validRoles = ['CONSUMER', 'FARMER', 'LARGE_SCALE_CONSUMER', 'COORDINATOR', 'ADVISER', 'GUEST'];
    const safeRole = validRoles.includes(finalRole) ? finalRole : 'GUEST';

    const validTypes = ['ADVISER', 'PLATFORM', 'DELIVERY', 'FARMER_EXPERIENCE', 'GENERAL'];
    const safeType = validTypes.includes(feedback_type) ? feedback_type : 'GENERAL';

    const userId = optionalUser ? optionalUser.id : null;
    const adviserIdNum = adviser_id ? Number(adviser_id) : null;

    const insertResult = db.prepare(`
      INSERT INTO feedback (user_id, submitter_role, submitter_name, submitter_contact, feedback_type, adviser_id, rating, comments)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      safeRole,
      submitter_name.trim(),
      submitter_contact ? submitter_contact.trim() : null,
      safeType,
      adviserIdNum,
      numRating,
      comments.trim()
    );

    // Send notification to Admin ONLY (Feedback is strictly confidential to Admin)
    try {
      const admin = db.prepare("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1").get() as any;
      if (admin) {
        db.prepare(`
          INSERT INTO notifications (user_id, title, message, type)
          VALUES (?, ?, ?, 'INFO')
        `).run(
          admin.id,
          `New Feedback Submitted (${safeType})`,
          `${submitter_name} (${safeRole}) submitted new feedback (Confidential to Admin).`
        );
      }
    } catch (_) {}

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully to Administrator. Your response is kept confidential.',
      feedback_id: insertResult.lastInsertRowid
    });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// 4. Admin: View All Platform & Adviser Feedbacks
router.get('/', authenticateToken, authorizeRoles('ADMIN'), (req: AuthRequest, res) => {
  try {
    const { type, adviser_id } = req.query;
    let query = `
      SELECT f.*, 
             adv.full_name as adviser_name,
             ap.specialization as adviser_specialization,
             u.username as registered_username
      FROM feedback f
      LEFT JOIN users adv ON f.adviser_id = adv.id
      LEFT JOIN adviser_profiles ap ON adv.id = ap.user_id
      LEFT JOIN users u ON f.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (type && type !== 'ALL') {
      query += ` AND f.feedback_type = ?`;
      params.push(type);
    }
    if (adviser_id && adviser_id !== 'ALL') {
      query += ` AND f.adviser_id = ?`;
      params.push(adviser_id);
    }

    query += ` ORDER BY f.created_at DESC`;

    const feedbacks = db.prepare(query).all(...params);

    const totalCount = (db.prepare("SELECT COUNT(*) as c FROM feedback").get() as any).c;
    const adviserFeedbackCount = (db.prepare("SELECT COUNT(*) as c FROM feedback WHERE feedback_type = 'ADVISER'").get() as any).c;
    const avgAdviserRating = (db.prepare("SELECT AVG(rating) as r FROM feedback WHERE feedback_type = 'ADVISER'").get() as any).r;

    res.json({
      total_feedback: totalCount,
      adviser_feedback_count: adviserFeedbackCount,
      avg_adviser_rating: avgAdviserRating ? Number(Number(avgAdviserRating).toFixed(1)) : 0,
      feedbacks
    });
  } catch (err) {
    console.error('Error fetching admin feedback:', err);
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
});

// 5. Admin: Delete Feedback
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), (req: AuthRequest, res) => {
  try {
    db.prepare("DELETE FROM feedback WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: 'Feedback removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

export default router;
