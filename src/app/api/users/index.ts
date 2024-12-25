import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../lib/mysql';
import { RowDataPacket } from 'mysql2';

interface User extends RowDataPacket {
  user_id: string;
  email: string;
  password: string;  // Handled internally and included in the response
  profile_picture: Buffer;
  gender: string;
  preferred_language: string;
  phone_number: string;
  date_of_birth: Date;
  first_name: string;
  middle_name: string;
  last_name: string;
  diagnosis_status: string;
}

// GET all users
async function getAllUsers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [users] = await pool.query<User[]>('SELECT * FROM User');
    res.status(200).json(users);  // Sends all data, including password
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

// POST a new user
async function createUser(req: NextApiRequest, res: NextApiResponse) {
  const { user_id, email, password, gender, preferred_language, phone_number, date_of_birth, first_name, middle_name, last_name, diagnosis_status } = req.body;
  try {
    await pool.execute(
      'INSERT INTO User (user_id, email, password, gender, preferred_language, phone_number, date_of_birth, first_name, middle_name, last_name, diagnosis_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, email, password, gender, preferred_language, phone_number, date_of_birth, first_name, middle_name, last_name, diagnosis_status]
    );
    // Returning all information, including sensitive data like password
    res.status(201).json({ user_id, email, password, first_name, last_name, gender, preferred_language, phone_number, date_of_birth, middle_name, diagnosis_status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getAllUsers(req, res);
    case 'POST':
      return createUser(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
