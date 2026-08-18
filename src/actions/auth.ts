'use server';

import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function registerUser(
  email: string,
  password: string,
  name?: string,
) {
  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'User already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email,
        name,
        hashedPassword,
        role: 'CUSTOMER',
      },
    });

    return { success: true, user: { id: user.id, email: user.email } };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred' };
  }
}
