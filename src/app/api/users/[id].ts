import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../lib/mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface User extends RowDataPacket {
  user_id: string;
  email: string;
  gender: string;
  preferred_language: string;
  phone_number: string;
  date_of_birth: Date;
  first_name: string;
  middle_name: string;
  last_name: string;
  diagnosis_status: string;
}

// GET a single user
async function getUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [users] = await pool.query<User[]>('SELECT * FROM User WHERE user_id = ?', [req.query.id as string]);
    if (users.length > 0) {
      res.status(200).json(users[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

// Update a user
async function updateUser(req: NextApiRequest, res: NextApiResponse) {
  const {
    email, gender, preferred_language, phone_number, date_of_birth,
    first_name, middle_name, last_name, diagnosis_status
  } = req.body;
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE User SET email = ?, gender = ?, preferred_language = ?, phone_number = ?, date_of_birth = ?, first_name = ?, middle_name = ?, last_name = ?, diagnosis_status = ? WHERE user_id = ?',
      [email, gender, preferred_language, phone_number, date_of_birth, first_name, middle_name, last_name, diagnosis_status, req.query.id as string]
    );
    if (result.affectedRows > 0) {
      res.status(200).json({ id: req.query.id as string, email, first_name, last_name });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

// DELETE a user
async function deleteUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM User WHERE user_id = ?', [req.query.id as string]);
    if (result.affectedRows > 0) {
      res.status(204).end();  // No content to send back
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getUser(req, res);
    case 'PUT':
      return updateUser(req, res);
    case 'DELETE':
      return deleteUser(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
