import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req,res)
{
    if(req.body)
    {
        let request = req.body;
        const client = await connectToDatabase();
        const user = await client.db().collection('users').findOne({email:request.email,reset_token:request.token});
        if(user)
        {
            const resetToken = await client.db().collection('users').updateMany({email:request.email,reset_token:request.token},{$unset:{reset_token:""}});

            return res.status(200).json({success:true,user:user})
        }
        else
        {
            return res.status(200).json({success:false,message:'token Expired!'})
        }
        
    }
    
    return res.status(200).json({success:false,message:'Bad Token!'});
}