const { createCommande } = require('../fonctions/commands/commandBuilder');
const { MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commande_json_path = './commands/unmute-command.json';
const mute_data_path = path.join(__dirname, '../Shared_folder/mutes.json');
const commande = createCommande(commande_json_path);

module.exports = {
    data: commande,
    async execute(interaction) {
        try {
            const user = interaction.options.getUser('user');

            if (!user) {
                return await interaction.reply({
                    content: "❌Veuillez spécifier un utilisateur valide.",
                    flags: MessageFlags.Ephemeral
                });
            }

            let muteData = {};
            if (fs.existsSync(mute_data_path)) {
                muteData = JSON.parse(fs.readFileSync(mute_data_path, 'utf8'));
            }

            if (!muteData[user.id]) {
                return await interaction.reply({
                    content: `❌L'utilisateur ${user.username} n'était pas muté.`,
                    flags: MessageFlags.Ephemeral
                });
            }

            delete muteData[user.id];

            fs.writeFileSync(mute_data_path, JSON.stringify(muteData, null, 4), 'utf8');

            await interaction.reply({
                content: `✅L'utilisateur ${user} a été démuté avec succès.`,
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
