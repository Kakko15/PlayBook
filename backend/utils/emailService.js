import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"PlayBook" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
};

const emailTemplate = (title, preheader, content) => {
  const primaryColor = "#16a34a";
  const lightGray = "#f0fdf4"; // Very light green tint for background
  const cardBg = "#ffffff";
  const textDark = "#1a1c1e";
  const textMedium = "#444746";
  const logoUrl = `${process.env.FRONTEND_URL}/playbook_logo.png`;
  const year = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: ${lightGray};
          font-family: 'Google Sans', 'Roboto', Arial, sans-serif;
          color: ${textDark};
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .card {
          background-color: ${cardBg};
          border-radius: 28px;
          padding: 40px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.05);
          border: 1px solid #e0e2e0;
        }
        .logo {
          width: 64px;
          height: 64px;
          margin-bottom: 24px;
        }
        h1 {
          font-size: 24px;
          font-weight: 400;
          margin: 0 0 24px 0;
          color: ${textDark};
          line-height: 32px;
        }
        p {
          font-size: 16px;
          line-height: 24px;
          color: ${textMedium};
          margin: 0 0 24px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: ${primaryColor};
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 100px;
          font-weight: 500;
          font-size: 14px;
          letter-spacing: 0.1px;
          transition: box-shadow 0.2s;
        }
        .footer {
          margin-top: 32px;
          text-align: center;
          font-size: 12px;
          color: #747775;
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: ${lightGray};">
      <span style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</span>
      
      <div class="email-container">
        <div class="card">
          <div style="text-align: center;">
            <img src="${logoUrl}" alt="PlayBook" class="logo" style="width: 64px; height: 64px; margin-bottom: 24px;">
          </div>
          
          ${content}
          
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #747775;">
            &copy; ${year} PlayBook & Isabela State University.
          </p>
          <p style="margin: 0; font-size: 12px; color: #747775;">
            This is an automated message. Please do not reply.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendApprovalEmail = async (userEmail, userName) => {
  const title = "Account Approved";
  const preheader = "You can now log in and start managing tournaments.";
  const content = `
    <h1 style="text-align: center;">Welcome to PlayBook!</h1>
    <p style="text-align: center;">
      Hi ${userName}, good news! Your administrator account has been reviewed and approved. You now have full access to manage tournaments, teams, and stats.
    </p>
    <div style="text-align: center; margin-top: 32px; margin-bottom: 32px;">
      <a href="${process.env.FRONTEND_URL}/login" class="button" style="display: inline-block; padding: 12px 24px; background-color: #16a34a; color: #ffffff !important; text-decoration: none; border-radius: 100px; font-weight: 500; font-size: 14px;">
        Log In to PlayBook
      </a>
    </div>
  `;
  const html = emailTemplate(title, preheader, content);
  await sendEmail(userEmail, title, html);
};

export const sendRejectionEmail = async (userEmail, userName) => {
  const title = "Registration Update";
  const preheader = "An update on your PlayBook account status.";
  const content = `
    <h1 style="text-align: center;">Account Registration</h1>
    <p>Hi ${userName},</p>
    <p>
      Thank you for your interest in PlayBook. After reviewing your application, we regret to inform you that your request for an administrator account has not been approved at this time.
    </p>
    <p>
      If you believe this is an error or would like more information, please contact the Super Admin.
    </p>
  `;
  const html = emailTemplate(title, preheader, content);
  await sendEmail(userEmail, title, html);
};

export const sendSuspensionEmail = async (userEmail, userName) => {
  const title = "Account Suspended";
  const preheader = "Your account access has been temporarily revoked.";
  const content = `
    <h1 style="text-align: center; color: #b3261e;">Account Suspended</h1>
    <p>Hi ${userName},</p>
    <p>
      Your PlayBook administrator account has been suspended by a Super Admin. You will not be able to log in or access the system until further notice.
    </p>
    <p>
      Please contact the administration if you believe this action was taken in error.
    </p>
  `;
  const html = emailTemplate(title, preheader, content);
  await sendEmail(userEmail, title, html);
};

export const sendDeletionEmail = async (userEmail, userName) => {
  const title = "Account Deleted";
  const preheader = "Your account and associated data have been removed.";
  const content = `
    <h1 style="text-align: center;">Account Deleted</h1>
    <p>Hi ${userName},</p>
    <p>
      Your PlayBook administrator account has been permanently deleted by a Super Admin. All associated data has been removed from our system.
    </p>
    <p>
      We hope to see you again in the future.
    </p>
  `;
  const html = emailTemplate(title, preheader, content);
  await sendEmail(userEmail, title, html);
};

export const sendPasswordResetEmail = async (userEmail, userName, resetUrl) => {
  const title = "Reset Password";
  const preheader = "A request was made to reset your password.";
  const content = `
    <h1 style="text-align: center;">Reset Your Password</h1>
    <p style="text-align: center;">
      Hi ${userName}, we received a request to reset the password for your PlayBook account.
    </p>
    <div style="text-align: center; margin-top: 32px; margin-bottom: 32px;">
      <a href="${resetUrl}" class="button" style="display: inline-block; padding: 12px 24px; background-color: #16a34a; color: #ffffff !important; text-decoration: none; border-radius: 100px; font-weight: 500; font-size: 14px;">
        Reset Password
      </a>
    </div>
    <p style="font-size: 14px; color: #747775; text-align: center;">
      This link expires in 1 hour. If you didn't ask for this, you can safely ignore this email.
    </p>
  `;
  const html = emailTemplate(title, preheader, content);
  await sendEmail(userEmail, title, html);
};

export const sendVerificationEmail = async (userEmail, userName, verifyUrl) => {
  const title = "Verify Email";
  const preheader = "One last step to get started with PlayBook.";
  const content = `
    <h1 style="text-align: center;">Verify Your Email</h1>
    <p style="text-align: center;">
      Welcome to PlayBook, ${userName}! We're excited to have you. Please verify your email address to continue.
    </p>
    <div style="text-align: center; margin-top: 32px; margin-bottom: 32px;">
      <a href="${verifyUrl}" class="button" style="display: inline-block; padding: 12px 24px; background-color: #16a34a; color: #ffffff !important; text-decoration: none; border-radius: 100px; font-weight: 500; font-size: 14px;">
        Verify Email
      </a>
    </div>
    <p style="font-size: 14px; color: #747775; text-align: center;">
      This link expires in 24 hours.
    </p>
  `;
  const html = emailTemplate(title, preheader, content);
  await sendEmail(userEmail, title, html);
};

export const sendOtpCodeEmail = async (userEmail, userName, otpCode) => {
  const title = "Login Code";
  const preheader = "Here is your one-time login code.";
  const content = `
    <h1 style="text-align: center;">Login Verification</h1>
    <p style="text-align: center;">
      Hi ${userName}, use the code below to complete your login to PlayBook.
    </p>
    <div style="background-color: #f0fdf4; border-radius: 16px; padding: 24px; text-align: center; margin: 32px 0; border: 1px solid #bbf7d0;">
      <span style="font-family: 'Google Sans', 'Roboto', monospace; font-size: 36px; font-weight: 500; letter-spacing: 8px; color: #14532d;">
        ${otpCode}
      </span>
    </div>
    <p style="font-size: 14px; color: #747775; text-align: center;">
      This code expires in 10 minutes. If you didn't request this, please ignore this email.
    </p>
  `;
  const html = emailTemplate(title, preheader, content);
  await sendEmail(userEmail, title, html);
};
