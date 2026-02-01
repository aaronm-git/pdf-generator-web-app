import { betterAuth } from 'better-auth';
import { Pool } from '@neondatabase/serverless';

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.POSTGRES_URL }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 1,
    maxPasswordLength: 128,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
