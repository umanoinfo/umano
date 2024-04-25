import { MongoClient } from 'mongodb'

export async function connectToDatabase() {
  
  const client = await MongoClient.connect(

    'mongodb+srv://umanoinfo00:B4l0jIYvEdtOzNDE@umanosing.6seqopc.mongodb.net/UmanoDB?retryWrites=true&w=majority'

    // 'mongodb+srv://localhost/'
    
    // 'mongodb://127.0.0.1:27017/umano?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.4'
    

  )
  

  setTimeout(() => {
    client.close()
  }, 300000)
  
  return client
}
