import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
    const client = await connectToDatabase()

    // ---------------------------- Token -------------------------------------

    const token = await getToken({ req })
    const myUser = await client.db().collection('users').findOne({ email: token.email })
    if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddPosition')) {
        return res.status(401).json({ success: false, message: 'Not Auth' })
    }
    if (!req.body.data.title) {
        return res.status(422).json({ success: false, message: 'Title is required' });
    }



    console.log(req.body);

    const position = await client
        .db()
        .collection('positions')
        .insertOne({
            company_id: myUser.company_id,
            title: req.body.data.title
        })


    return res.status(200).json({ success: true, data: position })
}
