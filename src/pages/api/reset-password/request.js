import { mailOptions, transporter } from 'src/configs/nodemailer'
import { getCsrfToken } from "next-auth/react";
import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'

const CONTACT_MESSAGE_FIELDS = {
  name: 'Name',
  email: 'Email',
  subject: 'Subject',
  link: "link",
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
    html: `<!DOCTYPE html><html> <head> <title></title> <meta charset="utf-8"/> 
    <meta name="viewport" content="width=device-width, initial-scale=1"/> 
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/> 
    <style type="text/css"> body, table, td, a{-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}table{border-collapse: collapse !important;}body{height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important;}@media screen and (max-width: 525px){.wrapper{width: 100% !important; max-width: 100% !important;}.responsive-table{width: 100% !important;}.padding{padding: 10px 5% 15px 5% !important;}.section-padding{padding: 0 15px 50px 15px !important;}}.form-container{margin-bottom: 24px; padding: 20px; border: 1px dashed #ccc;}.form-heading{color: #2a2a2a; font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif; font-weight: 400; text-align: left; line-height: 20px; font-size: 18px; margin: 0 0 8px; padding: 0;}.form-answer{color: #2a2a2a; font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif; font-weight: 300; text-align: left; line-height: 20px; font-size: 16px; margin: 0 0 24px; padding: 0;}div[style*="margin: 16px 0;"]{margin: 0 !important;}</style> </head> 
    <body style="margin: 0 !important; background: #dddddd; padding-bottom:100px; padding-top:30px;"> 
    <div style="padding:25px; margin:10px auto; max-width:500px;">
    </div>
    <div style="border-radius:15px; padding:10px; margin:50px auto; max-width:500px; background-color:#fff; color:#2a2a2a; text-align: left;">

    <img src="https://www.umano-si9k.vercel.app/images/pages/auth-v2-login-illustration-bordered-light.png" style="width:200px;" />

    <div className="form-container">

    <h2>${data.subject}</h2>
    <br />
    </div>
    <div> <a style="padding:10px; background:#189ab4; border-radius:5px; margin-top:200px; margin-bottom:400px; color:#fff; text-decoration:none; font-weight:bold; color:#ffffff;" href="${data.link}">Reset Your Password</a></div>
    <br />
    <b>After you click the button above, you'll be prompted to complete the following steps</b>
 
    <p>Enter new password</p>
    <p>Confirm your new password</p>
    <p>Hit Submit</p>
  
    <br><br>
    <h3>This link is valid for one use only. It will expire in 2 hours</h3>
    <p>
    If you didn't request this password reset or you received this message in error, please disregard this email
    </p>
    </div>
    </body></html>`
  }
}

const handler = async (req, res) => {
  if (req.method === 'POST') {
    const token = await getCsrfToken();
    const data = req.body

    if (!data || !data.email) {
      return res.status(400).send({ message: 'Bad request', success: false })
    }

    const client = await connectToDatabase()

    const updateUsers = await client.db().collection('users').updateMany({email:data.email},{$set:{'reset_token':token}});
    const user = await client.db().collection('users').findOne({email:data.email});
      if(user)
        {
          data.name=user.name;
          data.subject='Password reset information';
          data.message='to reset password please click on link below:';
          data.link='https://www.umano-si9k.vercel.app/forgot-password/?email='+data.email+'&token='+token;
          try {
            await transporter
              .sendMail({
                ...mailOptions,
                ...generateEmailContent(data),
                subject: data.subject
              })
              .then(res => {})
              
            return res.status(200).json({ success: true })
          } catch (err) {
            return res.status(400).json({ message: err.message });
        }
      }
  }

  return res.status(400).json({ message: 'Bad request', success: false })
}

export default handler
