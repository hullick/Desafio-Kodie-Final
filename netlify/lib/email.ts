import nodemailer from 'nodemailer';

/**
 * Envio de e-mail por SMTP: Mailpit localmente (http://localhost:8025), provedor real em
 * produção. Hoje só a redefinição de senha manda e-mail (o cadastro não pede confirmação).
 */

const transporte = nodemailer.createTransport({
  host: process.env['SMTP_HOST'] ?? 'localhost',
  port: Number(process.env['SMTP_PORT'] ?? 1025),
  secure: Number(process.env['SMTP_PORT']) === 465,
  auth: process.env['SMTP_USER'] ? { user: process.env['SMTP_USER'], pass: process.env['SMTP_PASS'] } : undefined,
});

export async function enviarEmail(m: { para: string; assunto: string; texto: string; html: string }): Promise<void> {
  await transporte.sendMail({
    from: process.env['EMAIL_REMETENTE'] ?? 'NuBanko <nao-responda@nubanko.local>',
    to: m.para,
    subject: m.assunto,
    text: m.texto,
    html: m.html,
  });
}

const escapar = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function emailRedefinicao(url: string): { assunto: string; texto: string; html: string } {
  return {
    assunto: 'Redefina sua senha do NuBanko',
    texto: `Recebemos um pedido para redefinir sua senha.\n\nAbra o link para criar uma nova (vale por 1 hora):\n${url}\n\nSe não foi você, ignore este e-mail: sua senha continua a mesma.`,
    html: `<p>Recebemos um pedido para redefinir sua senha.</p>
<p><a href="${escapar(url)}">Criar uma nova senha</a> (o link vale por 1 hora).</p>
<p>Se não foi você, ignore este e-mail: sua senha continua a mesma.</p>`,
  };
}
