const { createCommande } = require('../fonctions/commands/commandBuilder');
const { MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commande_json_path = './commands/mute-command.json';
const mute_data_path = path.join(__dirname, '../Shared_folder/mutes.json');
const commande = createCommande(commande_json_path);

module.exports = {
    data: commande,
    async execute(interaction) {
        try {
            const user = interaction.options.getUser('user');
            const dureeMinutes = interaction.options.getInteger('duree');

            if (!user || isNaN(dureeMinutes)) {
                return await interaction.reply({
                    content: "❌Veuillez spécifier un utilisateur valide et une durée en minutes.",
                    flags: MessageFlags.Ephemeral
                });
            }

            const expiration = Date.now() + dureeMinutes * 60000;
            const expirationFormatted = new Date(expiration).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

            let muteData = {};
            if (fs.existsSync(mute_data_path)) {
                muteData = JSON.parse(fs.readFileSync(mute_data_path, 'utf8'));
            }

            muteData[user.id] = {
                username: user.username,
                expiresAt: expiration
            };

            fs.writeFileSync(mute_data_path, JSON.stringify(muteData, null, 4), 'utf8');

            await interaction.reply({
                content: `✅L'utilisateur ${user.username} a été muté jusqu'au ${expirationFormatted}.`,
            });
        } catch (error) {
            console.error('❌Erreur lors de l\'exécution de la commande :', error);
            return await interaction.reply({
                content: "❌Une erreur s'est produite lors du traitement de votre demande.",
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
