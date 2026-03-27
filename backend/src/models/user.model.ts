import { db } from "../config/db";

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export async function createUser(email: string, name: string, passwordHash: string): Promise<User> {
  const result = await db.query<User>(
    `INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING *`,
    [email, name, passwordHash]
  );
  return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await db.query<User>(`SELECT * FROM users WHERE email = $1`, [email]);
  return result.rows[0] ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await db.query<User>(`SELECT * FROM users WHERE id = $1`, [id]);
  return result.rows[0] ?? null;
}
