const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "baheer224@gmail.com",
    pass: "roql eupe nfbv oczn",
  },
});

async function sendOTPEmail(email, otp) {
  const mailOptions = {
    from: '"eTailer Support" <baheer224@gmail.com>',
    to: email,
    subject: "Your eTailer OTP - Action Required",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; padding: 40px;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); text-align: center;">
          <h1 style="color: #17E7EA; font-size: 28px; margin-bottom: 20px;">eTailer</h1>
          <img src="https://img.icons8.com/clouds/100/000000/email.png" alt="email icon" style="width: 60px; margin-bottom: 20px;" />
          <h2 style="color: #333;">Your One-Time Password (OTP)</h2>
          <p style="color: #555; font-size: 15px; margin-bottom: 30px;">
            Use the following OTP to verify your email address with <strong>eTailer</strong>.
          </p>
          <h1 style="font-size: 48px; color: #7b3fe4; margin: 10px 0;">${otp}</h1>
          <p style="font-size: 13px; color: #ff4444;">This OTP is valid for 10 minutes only.</p>
        </div>
        <div style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
          <a href="#" style="color: #888; margin: 0 10px;">FAQs</a> |
          <a href="#" style="color: #888; margin: 0 10px;">Terms & Conditions</a> |
          <a href="#" style="color: #888; margin: 0 10px;">Contact Us</a>
          <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} eTailer. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendOTPEmail };
