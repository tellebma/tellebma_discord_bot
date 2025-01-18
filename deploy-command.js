/**
 * Ce script met à jour les commandes Discord.
 * Codes d'erreur :
 *   0 : Commandes mises à jour avec succès.
 *  10 : Erreur lors de la mise à jour des commandes.
 *  20 : Problème d'écriture du fichier.
 */

const { REST, Routes } = require('discord.js');
const fs = require('fs');

const updateFile = process.env.FICHIER_UPDATE_COMMANDE || './.commandeUpToDate';

// Vérifier que les variables d'environnement requises sont définies
if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_CLIENT_ID) {
    console.error('❌ DISCORD_TOKEN ou DISCORD_CLIENT_ID manquant dans les variables d\'environnement.');
    process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Générer un timestamp
const now = new Date();
const timestamp = now.toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
    dateStyle: 'short',
    timeStyle: 'short',
});

// Contenu du fichier avec le timestamp
const fileContent = `Fichier généré automatiquement après l'exécution du script deploy-command.js. 
Si ce fichier est supprimé, le script sera relancé automatiquement et le contenu des commandes Discord sera mis à jour.
Date de génération : ${timestamp}`;

// Fonction pour charger les commandes
function loadCommands() {
    const commands = [];
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
    }

    return commands;
}

// Fonction pour supprimer toutes les commandes
async function deleteAllCommands() {
    try {
        console.log('🧹 Suppression de toutes les commandes Slash...');
        await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: [] });
        console.log('✅ Toutes les commandes ont été supprimées.');
    } catch (error) {
        console.error('❌ Erreur lors de la suppression des commandes Slash :', error);
        process.exit(10);
    }
}

// Fonction pour enregistrer les commandes sur Discord
async function deployCommands(commands) {
    try {
        console.log('🔧 Enregistrement des commandes Slash...');
        await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: commands });
        console.log('✅ Commandes Slash déployées avec succès.');
        console.debug(commands);
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de l\'enregistrement des commandes Slash :', error);
        return false;
    }
}

// Fonction pour écrire le fichier de mise à jour
function writeUpdateFile(content) {
    try {
        fs.writeFileSync(updateFile, content);
        console.log(`✅ Fichier "${updateFile}" créé avec succès.`);
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la création du fichier :', error);
        return false;
    }
}

// Main
(async () => {
    

    const commands = loadCommands();
    if (!commands.length) {
        console.error('❌ Aucune commande trouvée à déployer.');
        process.exit(10);
    }
    await deleteAllCommands();
    const deploySuccess = await deployCommands(commands);

    if (!deploySuccess) {
        process.exit(10);
    }

    const writeSuccess = writeUpdateFile(fileContent);

    if (!writeSuccess) {
        process.exit(20);
    }

    console.log('🎉 Mise à jour des commandes terminée avec succès.');
    process.exit(0);
})();
