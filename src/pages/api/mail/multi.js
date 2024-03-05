import { mailOptions, transporter } from 'src/configs/nodemailer'
import { hashPassword } from 'src/configs/auth'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

const CONTACT_MESSAGE_FIELDS = {
  name: 'Name',
  email: 'Email',
  subject: 'Subject',
  message: 'Message'
}

const generateEmailContent = data => {

  const stringData = Object.entries(data).reduce(
    (str, [key, val]) => (str += `${CONTACT_MESSAGE_FIELDS[key]}: \n${val} \n \n`),
    ''
  )

  const htmlData = Object.entries(data).reduce((str, [key, val]) => {
    return (str += `<h3 className="form-heading" align="left">${CONTACT_MESSAGE_FIELDS[key]}</h3><p className="form-answer" align="left">${val}</p>`)
  }, '')

  return {
    to: data.email,
    text: stringData,
    html: `
    <h2>${data.subject}</h2>
    <div className="form-container">
    Mr/Mrs : ${data.toUser}
    </div>
    <p>${data.message}</p>
    <br>
    <p>Date : ${data.date}</p>
    <br>
    <div> Email sent from ${data.user}</div>
    `
  }
}

const handler = async (req, res) => {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('SendMail')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  let succeedEmails = []
  let failedEmails = []

  const data = req.body
  if (!data || !data.users || !data.subject) {
    return res.status(400).send({ message: 'Bad request', success: false })
  }

  data.users.map(async user => {
    const selectedUser = client
      .db()
      .collection('employees')
      .findOne({ _id: ObjectId(user) })
      .then(res => {
        send(res)
      })
  })

  const send = async toUser => {
    let email = {}
    email.toUser = toUser.firstName + ' ' + toUser.lastName
    email.employee_id = toUser._id
    email.event_id = data.event_id
    email.message = data.message
    email.subject = data.subject
    email.type = data.type
    email.date = data.date
    email.email = toUser.email
    email.user = data.user
    email.user_id = myUser._id
    email.company_id = myUser.company_id
    email.created_at = new Date()

    await transporter
      .sendMail({
        ...mailOptions,
        ...generateEmailContent(email),
        subject: data.subject
      })
      .then(async res => {

        email.status = 'success'
        email.note = res
        const newEmail = await client.db().collection('emails').insertOne(email)
        succeedEmails.push(email)
      })
      .catch(async err => {
        email.status = 'failed'
        email.note = err
        const newEmail = await client.db().collection('emails').insertOne(email)
        failedEmails.push(email)
      })
  }

  return res.status(200).json({ success: true, data: succeedEmails })
}

export default handler
