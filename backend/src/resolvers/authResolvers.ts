import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Provider } from '../models';
import { Context } from '../middleware/auth';

export const authResolvers = {
  Query: {
    me: async (_: any, __: any, context: Context) => {
      if (!context.provider) throw new Error('Not authenticated');
      return context.provider;
    },
  },
  Mutation: {
    register: async (_: any, { input }: any) => {
      const existing = await Provider.findOne({ where: { email: input.email } });
      if (existing) throw new Error('Email already registered');

      const password_hash = await bcrypt.hash(input.password, 12);
      const provider = await Provider.create({
        first_name: input.first_name,
        last_name: input.last_name,
        email: input.email,
        password_hash,
        specialty: input.specialty,
        license_number: input.license_number,
      });

      const token = jwt.sign(
        { id: provider.id },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      return { token, provider };
    },
    login: async (_: any, { input }: any) => {
      const provider = await Provider.findOne({ where: { email: input.email } });
      if (!provider) throw new Error('Invalid credentials');

      const valid = await bcrypt.compare(input.password, provider.password_hash);
      if (!valid) throw new Error('Invalid credentials');

      const token = jwt.sign(
        { id: provider.id },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      return { token, provider };
    },
  },
};
