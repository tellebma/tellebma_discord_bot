const database = process.env.POSTGRES_DB;
const password = process.env.POSTGRES_PASSWORD;
const user = process.env.POSTGRES_USER;

// Configuration de la base de données
const dbConfig = {
    host: 'database',
    user: user,
    password: password,
    database: database,
    port: 5432
};

module.exports = {
    dbConfig
}