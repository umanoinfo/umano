import { ObjectId } from "mongodb";
import { hashPassword } from 'src/configs/auth'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handle(req,res)
{
    if(req.body)
    {
        let request = req.body;
        if(request.password && request.user)
        {
            const hashedPassword =  await hashPassword(request.password);
            const client = await connectToDatabase();
            const updatePassword = await client.db().collection('users').updateOne({_id:ObjectId(request.user._id)},{$set:{password:hashedPassword,password_reseted_at:new Date()}});

            return res.status(200).json({success:true});
        }

        return res.status(200).json({success:false,message:'No User!'});
    }
    
    return res.status(200).json({success:false,message:'Bad Request!'});
}