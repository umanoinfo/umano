// import { hashPassword } from "../../../lib/auth";
// import { connectToDatabase } from "../../../lib/dbConnect";

// async function handler(req, res) {
//   if (req.method !== "POST") {
//     return;
//   }
//   const data = req.body;
//   const { name, email, password ,type} = data;
  
//   if (
//     !name ||
//     !type ||
//     !email ||
//     !email.includes("@") ||
//     !password ||
//     password.trim().length < 7
//   ) {
//     res.status(422).json({
//       message:
//         "Invalid input - password should also be at least 7 characters long.",
//     });

//     return;
//   }
//   const client = await connectToDatabase();
//   const db = client.db();
//   const existingUser = await db.collection('users').findOne({email:email});
//   if(existingUser)
//   {
//     res.status(422).json({message:'User Already exists!'});
//     client.close();

//     return;
//   }

//   const hashedPassword =  await hashPassword(password);

//   const result = await db.collection("users").insertOne({
//     name:name,
//     email: email,
//     type: type,
//     password: hashedPassword,
//     created_at:new Date(),
//     updated_at:new Date(),
//     deleted_at:null
//   });

//   res.status(201).json({ message: "User Created!" });
  
//   client.close();
// }

// export default handler;
