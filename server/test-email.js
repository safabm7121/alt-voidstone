import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'voidstonestudio@gmail.com',
    pass: 'rfinxybarsydjojl'
  }
});

transporter.sendMail({
  from: '"Test" <voidstonestudio@gmail.com>',
  to: 'voidstonestudio@gmail.com',
  subject: 'Test Email',
  text: 'If you see this, email works!'
})
.then(info => console.log('Email sent:', info.messageId))
.catch(err => console.error('Email failed:', err));