import { env } from '@/env';
import { render } from '@react-email/render';
import nodemailer from 'nodemailer';
import { triedAsync } from './utils';
import { TRPCError } from '@trpc/server';

type MailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from: string;
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // TLS
  secure: true, // Must be false for port 587
  auth: {
    user: env.NM_EMAIL,
    pass: env.NM_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Sometimes needed for localhost
  },
});
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const getHTML = async <T extends (data: any) => React.JSX.Element>(
  template: T,
  data: Parameters<T>[0]
) => {

  return await render(template(data));
};

export const sentMail = async (mailOptions: MailOptions) => {
  console.log("trying to send mail")
  transporter.verify((error, success) => {
    if (error) {
      console.log("Error server is not ready:", error);
    } else {
      throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "Mail Server is not ready"});
    }
  });
  return triedAsync(transporter.sendMail(mailOptions));
};
