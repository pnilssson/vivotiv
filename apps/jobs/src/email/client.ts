import { resolve4 } from "node:dns/promises";
import nodemailer from "nodemailer";

import { env } from "../env";

let cachedTransporter: nodemailer.Transporter | null = null;

export async function getTransporter(): Promise<nodemailer.Transporter> {
  if (cachedTransporter) return cachedTransporter;

  // Resolve to IPv4 explicitly — Railway has no outbound IPv6
  const [ipv4] = await resolve4(env.SMTP_HOST);

  cachedTransporter = nodemailer.createTransport({
    host: ipv4,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    tls: { servername: env.SMTP_HOST },
  });

  return cachedTransporter;
}
