import nodemailer from "nodemailer";

export const mail = nodemailer.createTransport({
  service:"Gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOtpEmail = async (email: string, otp: string) => {
  await mail.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Hotela - OTP Code",
    text: `Your OTP code is: ${otp}`,
  });
};

export const sendEmail = async (email: string, subject: string, text: string) => {
  await mail.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: subject,
    text: text,
  }).catch(e => {
    console.error(e);
  })
};
