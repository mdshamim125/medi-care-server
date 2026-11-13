import nodemailer from "nodemailer";
import httpStatus from "http-status";
import config from "../../../config";
import ApiError from "../../errors/ApiError";
import { ContactInquiryInput } from "./contact.validation";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

const submitInquiry = async (inquiry: ContactInquiryInput) => {
  const inbox = config.emailSender.email;
  const appPassword = config.emailSender.app_pass;

  if (!inbox || !appPassword) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "The contact form is temporarily unavailable. Please email us directly.",
    );
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: inbox,
      pass: appPassword,
    },
  });

  const escapedName = escapeHtml(inquiry.name);
  const escapedEmail = escapeHtml(inquiry.email);
  const escapedSubject = escapeHtml(inquiry.subject);
  const escapedMessage = escapeHtml(inquiry.message);

  try {
    await transporter.sendMail({
      from: `"Medi-Care Website" <${inbox}>`,
      to: inbox,
      replyTo: inquiry.email,
      subject: "New Medi-Care website inquiry",
      text: [
        `Name: ${inquiry.name}`,
        `Email: ${inquiry.email}`,
        `Subject: ${inquiry.subject}`,
        "",
        inquiry.message,
      ].join("\n"),
      html: `
        <h2>New website inquiry</h2>
        <p><strong>Name:</strong> ${escapedName}</p>
        <p><strong>Email:</strong> ${escapedEmail}</p>
        <p><strong>Subject:</strong> ${escapedSubject}</p>
        <p><strong>Message:</strong></p>
        <p>${escapedMessage.replace(/\n/g, "<br>")}</p>
      `,
    });
  } catch (error) {
    console.error("Failed to deliver contact inquiry:", error);
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "We could not send your message right now. Please try again later.",
    );
  }
};

export const ContactService = {
  submitInquiry,
};
