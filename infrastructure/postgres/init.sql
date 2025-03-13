-- Création de la table users avec la colonne role
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Insertion d'un compte admin avec mot de passe haché
-- Le hash ci-dessous correspond à "motdepasseadmin" généré avec bcrypt et 10 salt rounds
INSERT INTO users (email, username, password, role)
VALUES (
    'admin@example.com',
    'admin',
    '$2b$10$i3PRLsVQ7TY9J1xguNjdXutP.2Dcv2k1aK.fF5KooJKMhttk2f3CO',
    'admin'
);
