const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = 'mongodb+srv://umanoinfo00:B4l0jIYvEdtOzNDE@umanosing.6seqopc.mongodb.net/UmanoDB?retryWrites=true&w=majority'; // Change this to your MongoDB connection string
const databaseName = 'UmanoDB'; // Change this to your database name

async function exportCollections() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db(databaseName);
    const collections = await database.listCollections().toArray();
    if(!fs.existsSync('database'))
    fs.mkdirSync('database');
    for (const collection of collections) {
      const collectionName = collection.name;
      const data = await database.collection(collectionName).find().toArray();
      const json = JSON.stringify(data, null, 2);

      fs.writeFileSync(`database/${collectionName}.json`, json);
      console.log(`Exported collection ${collectionName} to ${collectionName}.json`);
    }
  } catch (error) {
    console.error('Error exporting collections:', error);
  } finally {
    await client.close();
  }
}

exportCollections();

