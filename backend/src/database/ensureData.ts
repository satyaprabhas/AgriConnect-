import bcryptjs from 'bcryptjs';
import db from './db';

export const DEFAULT_VEGETABLES = [
  { name: 'Tomatoes', price: 25, unit: 'kg' },
  { name: 'Ladies Finger', price: 30, unit: 'kg' },
  { name: 'Cucumbers', price: 20, unit: 'kg' },
  { name: 'Spinach', price: 15, unit: 'bunch' },
  { name: 'Bottle Gourd', price: 18, unit: 'kg' },
  { name: 'Carrots', price: 28, unit: 'kg' },
  { name: 'Brinjal', price: 35, unit: 'kg' },
  { name: 'Ridge Gourd', price: 40, unit: 'kg' },
  { name: 'Bitter Gourd', price: 45, unit: 'kg' },
  { name: 'Tindora', price: 35, unit: 'kg' },
  { name: 'Cauliflower', price: 30, unit: 'kg' },
  { name: 'Beans', price: 50, unit: 'kg' },
  { name: 'Drumstick', price: 60, unit: 'kg' },
  { name: 'Potatoes', price: 30, unit: 'kg' },
  { name: 'Onions', price: 35, unit: 'kg' },
];

// Ensure vegetable catalog definitions exist
export function ensureVegetablesAndStock() {
  try {
    for (const veg of DEFAULT_VEGETABLES) {
      const existing: any = db.prepare("SELECT id FROM vegetables WHERE name = ?").get(veg.name);
      if (!existing) {
        db.prepare("INSERT INTO vegetables (name, current_price, unit, is_active) VALUES (?, ?, ?, 1)").run(veg.name, veg.price, veg.unit);
      } else {
        db.prepare("UPDATE vegetables SET is_active = 1 WHERE id = ?").run(existing.id);
      }
    }

    // Ensure Demo Adviser account (adviser1 / password123)
    const existingAdviser: any = db.prepare("SELECT id FROM users WHERE username = 'adviser1'").get();
    if (!existingAdviser) {
      const passHash = bcryptjs.hashSync('password123', 10);
      const advInfo = db.prepare(`
        INSERT INTO users (full_name, username, mobile_number, password_hash, role, email, address, village, district, state, pincode, is_verified)
        VALUES (?, ?, ?, ?, 'ADVISER', ?, ?, ?, ?, ?, ?, 1)
      `).run(
        'Dr. K. Ramesh (Senior Agronomist)', 'adviser1', '9848022338', passHash,
        'dr.ramesh@farmdirect.hub', 'Agricultural Research Center', 'Kakinada', 'Kakinada', 'Andhra Pradesh', '533001'
      );
      
      db.prepare(`
        INSERT INTO adviser_profiles (user_id, specialization, qualification, license_number, experience_years, bio)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        advInfo.lastInsertRowid, 'Plant Pathology & Organic Crop Protection', 'Ph.D in Agricultural Pathology',
        'AP-AGRI-EXP-4091', 14, 'Senior agricultural scientist specializing in vegetable disease diagnostics, bio-pesticides, and IPM.'
      );
    }

    // Ensure Demo Large Scale Consumer account (bulkbuyer1 / password123)
    const existingBulk: any = db.prepare("SELECT id FROM users WHERE username = 'bulkbuyer1'").get();
    if (!existingBulk) {
      const passHash = bcryptjs.hashSync('password123', 10);
      db.prepare(`
        INSERT INTO users (full_name, username, mobile_number, password_hash, role, email, address, village, district, state, pincode, is_verified)
        VALUES (?, ?, ?, ?, 'LARGE_SCALE_CONSUMER', ?, ?, ?, ?, ?, ?, 1)
      `).run(
        'Sri Sai Grand Hotel & Caterers', 'bulkbuyer1', '9988776655', passHash,
        'procurement@srisaigrand.com', 'Near Railway Station Road', 'Rajahmundry', 'East Godavari', 'Andhra Pradesh', '533101'
      );
    }

    // Ensure sample disease consultation case if none exists
    const consultationCount: any = db.prepare("SELECT COUNT(*) as count FROM crop_disease_consultations").get();
    if (!consultationCount || consultationCount.count === 0) {
      const farmer: any = db.prepare("SELECT id FROM users WHERE role = 'FARMER' LIMIT 1").get();
      if (farmer) {
        db.prepare(`
          INSERT INTO crop_disease_consultations (farmer_id, crop_name, image_url, symptoms, affected_area, status)
          VALUES (?, ?, ?, ?, ?, 'PENDING')
        `).run(
          farmer.id,
          'Tomatoes',
          '1789361063839.jpeg',
          'Concentric dark ring spots with yellow halos on lower leaves. Some leaves curling and drying up prematurely.',
          '0.5 Acres',
        );
      }
    }

    // Ensure sample feedback if none exists
    const feedbackCount: any = db.prepare("SELECT COUNT(*) as count FROM feedback").get();
    if (!feedbackCount || feedbackCount.count === 0) {
      const adviser: any = db.prepare("SELECT id FROM users WHERE role = 'ADVISER' LIMIT 1").get();
      const farmer: any = db.prepare("SELECT id, full_name, mobile_number FROM users WHERE role = 'FARMER' LIMIT 1").get();
      const consumer: any = db.prepare("SELECT id, full_name, mobile_number FROM users WHERE role = 'CONSUMER' LIMIT 1").get();

      if (adviser && farmer) {
        db.prepare(`
          INSERT INTO feedback (user_id, submitter_role, submitter_name, submitter_contact, feedback_type, adviser_id, rating, comments)
          VALUES (?, 'FARMER', ?, ?, 'ADVISER', ?, 5, ?)
        `).run(
          farmer.id,
          farmer.full_name || 'Ramesh Kumar',
          farmer.mobile_number || '9876543210',
          adviser.id,
          'Dr. Ramesh provided accurate diagnosis for my tomato crop early blight. The biological treatment recommendation saved almost 80% of my harvest. Highly knowledgeable and respectful!'
        );
      }

      if (adviser && consumer) {
        db.prepare(`
          INSERT INTO feedback (user_id, submitter_role, submitter_name, submitter_contact, feedback_type, adviser_id, rating, comments)
          VALUES (?, 'CONSUMER', ?, ?, 'ADVISER', ?, 5, ?)
        `).run(
          consumer.id,
          consumer.full_name || 'Ravi Kumar',
          consumer.mobile_number || '9876543220',
          adviser.id,
          'Appreciated the adviser guidance on seasonal organic veggies and soil quality. Helps us buy with full trust.'
        );
      }

      db.prepare(`
        INSERT INTO feedback (user_id, submitter_role, submitter_name, submitter_contact, feedback_type, adviser_id, rating, comments)
        VALUES (NULL, 'GUEST', 'Venkat Rao', 'venkat.rao@gmail.com', 'PLATFORM', NULL, 5, 'AgriConnect is transparent and directly connects farmers to consumers without greedy middlemen. Love the interface!')
      `).run();
    }
  } catch (err) {
    console.error('Error ensuring catalog and demo accounts:', err);
  }
}
