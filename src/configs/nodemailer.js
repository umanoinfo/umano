import nodemailer from 'nodemailer'

const email = 'feras@robin-sass.pioneers.network'
const pass = 'b^o}=~7GpXoC'

export const transporter = nodemailer.createTransport({
  host: 'mail.robin-sass.pioneers.network',
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
