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
            <p style="font-size: 0.9em; color: #777;">Cordialement,<br>L'équipe TER Saphir</p>
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
  
async function sendResetPasswordEmail(userEmail, resetLink) {
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: userEmail,
    subject: 'Réinitialisation de votre mot de passe',
    text: `Bonjour, veuillez cliquer sur le lien suivant pour réinitialiser votre mot de passe : ${resetLink}. Ce lien expirera dans 1 heure.`,
    html: `
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h1>Réinitialisation de votre mot de passe</h1>
          <p>Bonjour,</p>
          <p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe. Ce lien expirera dans 1 heure :</p>
          <p><a href="${resetLink}">Réinitialiser le mot de passe</a></p>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 0.9em; color: #777;">Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.</p>
          <p style="font-size: 0.9em; color: #777;">Cordialement,<br>L'équipe TER Saphir</p>

      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-mail de réinitialisation envoyé avec succès via Gmail SMTP');
  } catch (error) {
    console.error('Erreur lors de l’envoi de l’e-mail de réinitialisation via Gmail SMTP:', error);
    throw error;
  }
}
  
async function sendPasswordChangeConfirmationEmail(userEmail) {
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: userEmail,
    subject: 'Votre mot de passe a été modifié',
    text: `Bonjour, votre mot de passe a été modifié avec succès. Si vous n'avez pas initié ce changement, veuillez contacter immédiatement notre support.`,
    html: `
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h1>Confirmation de modification du mot de passe</h1>
          <p>Bonjour,</p>
          <p>Votre mot de passe a été modifié avec succès.</p>
          <p>Si vous n'avez pas initié ce changement, veuillez contacter immédiatement notre support.</p>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 0.9em; color: #777;">Cordialement,<br>L'équipe TER Saphir</p>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-mail de confirmation de modification du mot de passe envoyé avec succès');
  } catch (error) {
    console.error('Erreur lors de l’envoi de l’e-mail de confirmation de modification du mot de passe:', error);
    throw error;
  }
}
  
module.exports = { sendConfirmationEmail, sendResetPasswordEmail, sendPasswordChangeConfirmationEmail };
