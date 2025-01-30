import './tracer';
import * as http from 'http';
import { MongoConnection } from './utils/mongo-connection';

const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = process.env.PORT || 4000;

function healthCheck(req: http.IncomingMessage, res: http.ServerResponse) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'OK' }));
}

const httpServer = http.createServer((req, res) => {

  if (req.url === '/health') {
    return healthCheck(req, res);
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Welcome to Mongo Atlas Serverless demo!' }));
});

async function startServer() {
  try {
    const mongo = new MongoConnection();
    await mongo.connectDB();

    await new Promise<void>((resolve) =>
      httpServer.listen({ port: 4000 }, resolve),
    );
    console.log(`🚀 Server running at http://${hostname}:${port}`);

  } catch (error) {
    console.error(`Connection error: ${error}`);
    process.exit(1);
  }
}

startServer()
