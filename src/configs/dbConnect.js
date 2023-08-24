import { MongoClient } from 'mongodb'

export async function connectToDatabase() {
  const client = await MongoClient.connect(

    // 'mongodb+srv://umanoinfo00:B4l0jIYvEdtOzNDE@umano.ngqka2d.mongodb.net/UmanoDB?retryWrites=true&w=majority'

    'mongodb://localhost:27017/hr?retryWrites=true&w=majority'

  )
  setTimeout(() => {
    client.close()
  }, 30000)
  
  return client
}
