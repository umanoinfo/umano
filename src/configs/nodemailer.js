import nodemailer from 'nodemailer'

const email = 'sms@hr-trust.com'
const pass = 'SMS@2022'

export const transporter = nodemailer.createTransport({
  host: 'mail.hr-trust.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: email, // generated ethereal user
    pass: pass // generated ethereal password
  }
})

export const mailOptions = {
  from: email,
  to: email
}
