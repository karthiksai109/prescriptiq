import { ExpressContextFunctionArgument } from '@apollo/server/express4';
import jwt from 'jsonwebtoken';
import { Provider } from '../models';

export interface Context {
  provider: any | null;
  token: string | null;
}

export async function authMiddleware({ req }: ExpressContextFunctionArgument): Promise<Context> {
  const token = req.headers.authorization?.replace('Bearer ', '') || null;

  if (!token) {
    return { provider: null, token: null };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { id: number };
    const provider = await Provider.findByPk(decoded.id);
    return { provider, token };
  } catch {
    return { provider: null, token: null };
  }
}
