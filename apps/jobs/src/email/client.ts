import { lookup } from "node:dns";
import nodemailer from "nodemailer";

import { env } from "../env";

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  dnsLookup: (hostname, options, callback) =>
    lookup(hostname, { ...options, family: 4 }, callback),
});
