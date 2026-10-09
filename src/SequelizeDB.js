const fs = require("fs");
const { Sequelize } = require("sequelize");

// Chemin du certificat CA d'Aiven, défini uniquement en production
// (Secret File de Render : /etc/secrets/aiven-ca.pem).
// En local avec WAMP, la variable est absente : connexion sans SSL, comme avant.
const caPath = process.env.MYSQL_SSL_CA_PATH;

const sequelize = new Sequelize(process.env.MYSQL_DB, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
	host: process.env.MYSQL_HOST,
	port: process.env.MYSQL_PORT,
	dialect: "mysql",
	logging: false, // Désactive les logs SQL dans le terminal
	pool: {
		max: 10,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
	// Connexion chiffrée avec vérification du certificat du serveur.
	// mysql2 vérifie le certificat par défaut (rejectUnauthorized: true) :
	// fournir le CA d'Aiven lui permet de confirmer qu'il parle au vrai serveur.
	dialectOptions: caPath ? { ssl: { ca: fs.readFileSync(caPath) } } : {},
});

// Test de connexion
sequelize
	.authenticate()
	.then(() => console.log(`✅ Sequelize connecté à MySQL${caPath ? " (SSL)" : ""}`))
	.catch((err) => console.error("❌ Erreur Sequelize:", err.name, err.message || err.parent?.code || ""));
module.exports = sequelize;
