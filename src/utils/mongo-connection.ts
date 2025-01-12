import { config } from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";

config();

export class MongoConnection {
  client = new MongoClient( process.env.MONGO_URI || 'undefined', {
    serverApi: {
      version: ServerApiVersion.v1,
      deprecationErrors: true,
    },
  });

  async connectDB() {
    try {
      await this.client.connect();
      console.log('Successfully connected to mongo');
    } catch (error) {
      console.error(`Connection error: ${error}`);
      throw new Error('Failed to connect to mongo')
    }
  }
}
