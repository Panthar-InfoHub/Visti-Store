import { orderPlacedAdmin, orderPlacedUser } from "@/templates/Email";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure:false, // true for 465, false for 587
  authMethod: "LOGIN",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

});

export const sendMail = async (
  to: string,
  emailContent: { subject: string; text: string; html: string }
) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    };
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId, "to", to);
    return result;
  } catch (error: any) {
    // Provide helpful error messages based on error type
    if (error.code === "EAUTH") {
      console.error(
        "\n❌ authentication failed.\n"
      );
    } else if (error.code === "ECONNECTION") {
      console.error(
        "❌ Cannot connect to SMTP server. Check your internet connection and SMTP_HOST."
      );
    } else {
      console.error("❌ Error sending email:", error.message);
    }

    throw error;
  }
};

// Helper function to send order confirmation to user
export const sendOrderConfirmationToUser = async (
  orderDetails: Parameters<typeof orderPlacedUser>[0]
) => {
  const emailContent = orderPlacedUser(orderDetails);
  return await sendMail(orderDetails.customerEmail, emailContent);
};

// Helper function to send order notification to admin
export const sendOrderNotificationToAdmin = async (
  adminEmail: string,
  orderDetails: Parameters<typeof orderPlacedAdmin>[0]
) => {
  const emailContent = orderPlacedAdmin(orderDetails);
  return await sendMail(adminEmail, emailContent);
};
