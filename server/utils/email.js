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
  await transporter.sendMail({
    from: `"Voidstone Studio" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your email',
    html: `<h1>Welcome ${firstName}</h1><p>Your code: <b>${code}</b></p>`
  });
};

export const sendPasswordResetEmail = async (email, code, firstName) => {
  await transporter.sendMail({
    from: `"Voidstone Studio" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset',
    html: `<h1>Hi ${firstName}</h1><p>Your reset code: <b>${code}</b></p>`
  });
};