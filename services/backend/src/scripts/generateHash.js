const bcrypt = require('bcrypt');

const password = 'motdepasseadmin';
const saltRounds = 10;

// fonction pour hasher le mot de passe de l'admin
bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Erreur de hachage:', err);
  } else {
    console.log('Hash généré:', hash);
  }
});
