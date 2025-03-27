-- Création de la table users avec la colonne role
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    status BOOLEAN NOT NULL DEFAULT true,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Insertion d'un compte admin avec mot de passe haché
-- Le hash ci-dessous correspond à "motdepasseadmin" généré avec bcrypt et 10 salt rounds
INSERT INTO users (email, password, role, nom, prenom)
VALUES (
    'admin@example.com',
    '$2b$10$i3PRLsVQ7TY9J1xguNjdXutP.2Dcv2k1aK.fF5KooJKMhttk2f3CO',
    'admin',
    'Admin',
    'User'
);

-- Création de la table role_request pour gérer les demandes de changement de rôle
CREATE TABLE IF NOT EXISTS role_request (
    id SERIAL PRIMARY KEY,
    id_user INTEGER NOT NULL,
    lname VARCHAR(50) NOT NULL,
    fname VARCHAR(50) NOT NULL,
    desired_role VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
      FOREIGN KEY (id_user)
      REFERENCES users(id)
      ON DELETE CASCADE,
    CONSTRAINT status_valid CHECK (status IN ('pending', 'accepted', 'refused'))
);