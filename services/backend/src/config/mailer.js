require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',    // SMTP host
    port: 465,                 // Secure SMTP port
    secure: true,              // true for 465, false for other ports      
    auth: {
      user: process.env.EMAIL_ADDRESS,   
      pass: process.env.EMAIL_PASSWORD     
    }
});

async function sendConfirmationEmail(userEmail, prenom) {
    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: userEmail,
      subject: 'Confirmation de votre inscription',
      text: `Bonjour ${prenom}, votre inscription a été confirmée avec succès.
        Si vous ne souhaitez plus recevoir d'e-mails, veuillez vous désinscrire en envoyant un e-mail à unsubscribe@tondomaine.com.`,
      html: `
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h1>Bienvenue ${prenom} !</h1>
            <p>Votre inscription a été confirmée avec succès.</p>
            <p>Si vous ne souhaitez plus recevoir d'e-mails de notre part, <a href="mailto:unsubscribe@tondomaine.com?subject=Unsubscribe">cliquez ici pour vous désinscrire</a>.</p>
            <hr style="border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 0.9em; color: #777;">Cordialement,<br>L'équipe TerSaphir</p>
        </body>
        </html>
      `,
      headers: {
        'List-Unsubscribe': '<mailto:unsubscribe@tondomaine.com>'
      }
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('E-mail de confirmation envoyé avec succès via Gmail SMTP');
    } catch (error) {
      console.error('Erreur lors de l’envoi de l’e-mail via Gmail SMTP:', error);
    }
  }
  
  module.exports = { sendConfirmationEmail };
