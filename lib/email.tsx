import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function sendVerificationEmail(email: string, name: string, verificationUrl: string) {
  await transporter.sendMail({
    from: `"VERA's Store" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email - VERA's Store",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a8a;">Welcome to VERA's Store!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1e3a8a; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
  await transporter.sendMail({
    from: `"VERA's Store" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password - VERA's Store",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a8a;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1e3a8a; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      </div>
    `,
  })
}

export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderNumber: string,
  totalAmount: number,
) {
  await transporter.sendMail({
    from: `"VERA's Store" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Confirmation #${orderNumber} - VERA's Store`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a8a;">Order Confirmed!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for your order! Your order #${orderNumber} has been confirmed.</p>
        <p><strong>Total Amount:</strong> ₦${totalAmount.toLocaleString()}</p>
        <p>We'll send you another email when your order ships.</p>
        <a href="${process.env.NEXTAUTH_URL}/orders" style="display: inline-block; padding: 12px 24px; background-color: #1e3a8a; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Order</a>
      </div>
    `,
  })
}
