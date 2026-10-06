import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

console.log('Email config check:');
console.log('USER:', process.env.EMAIL_USER ? 'SET' : 'MISSING');
console.log('PASS:', process.env.EMAIL_PASS ? 'SET' : 'MISSING');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendOrderEmails = async (orderData) => {
  const formatDT = (amount) => `${amount.toFixed(3)} DT`;
  
  const itemsList = orderData.items.map(item => 
    `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${formatDT(item.price)}</td><td>${formatDT(item.price * item.quantity)}</td></tr>`
  ).join('');

  // Email to buyer
  await transporter.sendMail({
    from: `"Voidstone Studio" <${process.env.EMAIL_USER}>`,
    to: orderData.shippingInfo.email,
    subject: `Order Confirmation - ${orderData.orderId}`,
    html: `
      <h1>Thank you for your order, ${orderData.shippingInfo.firstName}!</h1>
      <p>Order ID: ${orderData.orderId}</p>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">
        <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
        ${itemsList}
      </table>
      <p style="font-size:18px;font-weight:bold">Total: ${formatDT(orderData.cartTotal)}</p>
    `
  });

  // Email to admin
  await transporter.sendMail({
    from: `"Voidstone Studio" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || 'voidstonestudio@gmail.com',
    subject: `New Order - ${orderData.orderId}`,
    html: `
      <h1>New Order Received</h1>
      <p>Order ID: ${orderData.orderId}</p>
      <p>Customer: ${orderData.shippingInfo.firstName} ${orderData.shippingInfo.lastName}</p>
      <p>Email: ${orderData.shippingInfo.email}</p>
      <p>Address: ${orderData.shippingInfo.address}, ${orderData.shippingInfo.city} ${orderData.shippingInfo.zipCode}</p>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">
        <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
        ${itemsList}
      </table>
      <p style="font-size:18px;font-weight:bold">Total: ${formatDT(orderData.cartTotal)}</p>
    `
  });
};

export const sendVerificationEmail = async (email, code, firstName) => {
  const info = await transporter.sendMail({
    from: `"Voidstone Studio" <${process.env.EMAIL_USER}>`,
    to: email,
    replyTo: process.env.EMAIL_USER,
    subject: `Welcome to Voidstone Studio, ${firstName}`,
    text: `Hi ${firstName},\n\nWelcome to Voidstone Studio!\n\nYour verification code is: ${code}\n\nEnter this code to activate your account.\n\nIf you did not create this account, you can ignore this email.\n\n— Voidstone Studio`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,sans-serif;">
        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0a0a0a;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#111111;border:1px solid #222222;">
                <tr>
                  <td style="padding:40px 40px 20px 40px;text-align:center;">
                    <h1 style="color:#ffffff;font-size:24px;margin:0;letter-spacing:2px;text-transform:uppercase;">Voidstone Studio</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 40px;">
                    <h2 style="color:#ffffff;font-size:20px;margin:0 0 20px 0;">Hi ${firstName},</h2>
                    <p style="color:#cccccc;font-size:15px;line-height:1.6;margin:0 0 24px 0;">
                      Thank you for joining Voidstone Studio. Please use the verification code below to activate your account:
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 40px 30px 40px;">
                    <div style="display:inline-block;padding:16px 32px;background-color:#0a0a0a;border:2px solid #ffffff;font-size:28px;font-weight:bold;color:#ffffff;letter-spacing:6px;font-family:'Courier New',monospace;">
                      ${code}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 40px 40px 40px;">
                    <p style="color:#888888;font-size:13px;line-height:1.6;margin:0;">
                      If you did not create an account with Voidstone Studio, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 40px;border-top:1px solid #222222;">
                    <p style="color:#666666;font-size:12px;margin:0;text-align:center;">© 2024 Voidstone Studio. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  });
  console.log('Verification email sent:', info.messageId, '→', email);
  return info;
};

export const sendPasswordResetEmail = async (email, code, firstName) => {
  await transporter.sendMail({
    from: `"Voidstone Studio" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset',
    html: `<h1>Hi ${firstName}</h1><p>Your reset code: <b>${code}</b></p>`
  });
};