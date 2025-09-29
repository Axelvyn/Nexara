const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isInitialized = false;
    this.initPromise = this.initTransporter();
  }

  async initTransporter() {
    try {
      // Check if Gmail credentials are provided
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        // Use Gmail with provided credentials
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        // Test the connection
        await this.transporter.verify();
        console.log(
          '📧 Gmail transporter initialized and verified for:',
          process.env.EMAIL_USER
        );
      } else {
        // Development: Use Ethereal Email for testing
        console.log(
          '📧 No Gmail credentials found, using Ethereal Email for testing...'
        );
        await this.createTestAccount();
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing email transporter:', error);

      // Fallback to Ethereal Email if Gmail fails
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        console.log('📧 Gmail failed, falling back to Ethereal Email...');
        try {
          await this.createTestAccount();
          this.isInitialized = true;
        } catch (fallbackError) {
          console.error('Fallback email setup also failed:', fallbackError);
          this.isInitialized = false;
        }
      } else {
        this.isInitialized = false;
      }
    }
  }

  async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log('📧 Test email account created:');
      console.log('   User:', testAccount.user);
      console.log('   Pass:', testAccount.pass);
    } catch (error) {
      console.error('Error creating test email account:', error);
      throw error;
    }
  }

  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initPromise;
    }
    return this.isInitialized;
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationEmail(email, firstName, otp) {
    await this.ensureInitialized();

    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Nexara" <noreply@nexara.com>',
      to: email,
      subject: 'Verify Your Email - Nexara',
      html: this.getVerificationEmailTemplate(firstName, otp),
      text: `Hi ${firstName},\n\nWelcome to Nexara! Please verify your email address by entering this code: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't create an account, please ignore this email.\n\nBest regards,\nThe Nexara Team`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);

      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl:
          process.env.NODE_ENV === 'development'
            ? nodemailer.getTestMessageUrl(info)
            : null,
      };
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendWelcomeEmail(email, firstName) {
    await this.ensureInitialized();

    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Nexara" <noreply@nexara.com>',
      to: email,
      subject: 'Welcome to Nexara! 🎉',
      html: this.getWelcomeEmailTemplate(firstName),
      text: `Hi ${firstName},\n\nWelcome to Nexara! Your email has been successfully verified.\n\nYou can now start using all features of our platform.\n\nGet started:\n- Create your first project\n- Invite team members\n- Set up your workspace\n\nNeed help? Feel free to reach out to our support team.\n\nBest regards,\nThe Nexara Team`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);

      if (process.env.NODE_ENV === 'development') {
        console.log(
          '📧 Welcome email preview URL:',
          nodemailer.getTestMessageUrl(info)
        );
      }

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error for welcome email - it's not critical
      return { success: false, error: error.message };
    }
  }

  getVerificationEmailTemplate(firstName, otp) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - Nexara</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
        .content { padding: 40px 20px; }
        .otp-container { background-color: #f1f5f9; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
        .otp-code { font-size: 36px; font-weight: bold; color: #1e293b; letter-spacing: 8px; margin: 20px 0; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Welcome to Nexara!</h1>
          <p>Project management made simple</p>
        </div>
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <p>Thank you for signing up for Nexara! To complete your registration, please verify your email address by entering the verification code below:</p>
          
          <div class="otp-container">
            <p style="margin: 0; color: #64748b; font-weight: 500;">Your verification code is:</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 0; color: #64748b; font-size: 14px;">This code will expire in 10 minutes</p>
          </div>
          
          <p>If you didn't create an account with Nexara, you can safely ignore this email.</p>
          
          <p>Best regards,<br>The Nexara Team</p>
        </div>
        <div class="footer">
          <p>© 2025 Nexara. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  getWelcomeEmailTemplate(firstName) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Nexara!</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
        .content { padding: 40px 20px; }
        .feature-list { background-color: #f0fdf4; border-radius: 12px; padding: 30px; margin: 30px 0; }
        .feature-item { margin: 15px 0; padding-left: 30px; position: relative; }
        .feature-item::before { content: "✅"; position: absolute; left: 0; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .button { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Nexara!</h1>
          <p>Your email has been verified successfully</p>
        </div>
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <p>Congratulations! Your email has been successfully verified and your Nexara account is now active.</p>
          
          <div class="feature-list">
            <h3>🚀 Ready to get started? Here's what you can do:</h3>
            <div class="feature-item">Create your first project and organize your workflow</div>
            <div class="feature-item">Invite team members to collaborate</div>
            <div class="feature-item">Set up boards and track your progress</div>
            <div class="feature-item">Manage issues and tasks efficiently</div>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/userdashboard" class="button">Get Started Now</a>
          </div>
          
          <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
          
          <p>Happy project managing!<br>The Nexara Team</p>
        </div>
        <div class="footer">
          <p>© 2025 Nexara. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}

module.exports = new EmailService();
