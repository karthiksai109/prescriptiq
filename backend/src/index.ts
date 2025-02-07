import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';
import { sequelize } from './models';
import { authMiddleware, Context } from './middleware/auth';

dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  const app = express();

  // Sync database models
  await sequelize.sync({ alter: true });
  console.log('Database synced successfully');

  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
    }),
    express.json(),
    expressMiddleware(server, {
      context: authMiddleware,
    })
  );

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════╗
    ║      PrescriptiQ GraphQL API Server           ║
    ║      http://localhost:${PORT}/graphql              ║
    ╚═══════════════════════════════════════════════╝
    Started at: ${new Date().toISOString()}
    `);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
