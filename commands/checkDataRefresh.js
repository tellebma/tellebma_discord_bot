const { EmbedBuilder, MessageFlags } = require('discord.js');
const { createCommande } = require('../fonctions/commands/commandBuilder');
const { fetchAllInfos } = require('../fonctions/api/matchs')

// Charger les données de la commande depuis le fichier JSON
const commande_json_path = './commands/checkDataRefresh-command.json';
const commande = createCommande(commande_json_path);

module.exports = {
    data: commande,
    async execute(interaction) {
        try {
            await fetchAllInfos();
            // Envoyer l'embed avec l'image
            return await interaction.reply({
                content: "✅L'api à l'air de fonctionner.",
                flags: MessageFlags.Ephemeral
            });

        } catch (error) {
            console.error('❌Erreur lors de l\'exécution de la commande :', error);
            return await interaction.reply({
                content: "❌L'api à l'air KO.",
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
