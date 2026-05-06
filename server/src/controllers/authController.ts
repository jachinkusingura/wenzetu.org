import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { AuthRequest, AuthResponse, User } from '../types/index.js';
import * as db from '../database/connection.js';

export async function register(data: AuthRequest & { first_name?: string; last_name?: string; role?: string }): Promise<AuthResponse> {
  console.log('Registration attempt with data:', { ...data, password: '***' });
  const { email, password, first_name, last_name, role } = data;

  // Validation
  if (!email || !password) {
    const error: any = new Error('Email and password are required');
    error.status = 400;
    throw error;
  }

  if (password.length < 6) {
    const error: any = new Error('Password must be at least 6 characters');
    error.status = 400;
    throw error;
  }

  // Check if user exists
  const existingUser = await db.queryOne(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existingUser) {
    const error: any = new Error('User already exists');
    error.status = 409;
    throw error;
  }

  // Hash password
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(password, salt);

  // Create user in database
  const isPostgres = process.env.DB_TYPE === 'postgres';
  const insertQuery = isPostgres
    ? 'INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?) RETURNING id'
    : 'INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)';

  const userRole = role || 'patient';
  const result = await db.execute(insertQuery, [email, hashedPassword, first_name || null, last_name || null, userRole]);
  
  console.log('Registration database result:', result);
  
  let userId;
  if (isPostgres) {
    userId = result[0].id;
  } else {
    userId = (result as any).insertId;
  }

  console.log('Generated userId:', userId);

  // Generate token
  const token = jwt.sign(
    { id: userId, email, role: userRole },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: (process.env.JWT_EXPIRE || '7d') as any }
  );

  const user = {
    id: userId,
    email,
    first_name: first_name || '',
    last_name: last_name || '',
    role: userRole as any,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  } as Omit<User, 'password'>;

  return { token, user };
}

export async function login(data: AuthRequest & { role?: string }): Promise<AuthResponse> {
  const { email, password, role } = data;

  // Validation
  if (!email || !password) {
    const error: any = new Error('Email and password are required');
    error.status = 400;
    throw error;
  }

  // Find user
  const user = await db.queryOne(
    'SELECT id, email, password, first_name, last_name, role FROM users WHERE email = ?',
    [email]
  );

  if (!user) {
    const error: any = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  // Check role if provided
  if (role && user.role !== role) {
    const error: any = new Error('Selected role does not match user account');
    error.status = 403;
    throw error;
  }

  // Verify password
  const isPasswordValid = await bcryptjs.compare(password, user.password);
  if (!isPasswordValid) {
    const error: any = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  // Generate token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: (process.env.JWT_EXPIRE || '7d') as any }
  );

  const userResponse = {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    is_active: user.is_active ?? true,
    created_at: user.created_at ?? new Date(),
    updated_at: user.updated_at ?? new Date()
  } as Omit<User, 'password'>;

  return { token, user: userResponse };
}
