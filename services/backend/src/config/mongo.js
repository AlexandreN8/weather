const mongoose = require('mongoose');

//CONNEXION A MONGODB

//console.log('process.env.MONGO_URI:', process.env.MONGO_URI);

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/weatherDB';

//console.log('Tentative de connexion à MongoDB avec URI :', mongoURI);

mongoose.connect(mongoURI, { 
  useNewUrlParser: true,
  useUnifiedTopology: true 
})
.then(() => console.log('Connexion à MongoDB réussie'))
.catch((err) => console.error('Erreur de connexion à MongoDB:', err));


module.exports = mongoose;