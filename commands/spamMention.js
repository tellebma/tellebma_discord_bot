const { createCommande } = require('../fonctions/commands/commandBuilder');
const { MessageFlags } = require('discord.js');

const commande_json_path = './commands/spamMention-command.json';
const commande = createCommande(commande_json_path);

module.exports = {
    data: commande,
    async execute(interaction) {
        try {
            const user = interaction.options.getUser('user');
            if (!user) {
                return await interaction.reply({
                    content: "❌ Vous devez mentionner un utilisateur.",
                    flags: MessageFlags.Ephemeral
                });
            }

            await interaction.reply({
                content: `✅ L'utilisateur ${user.username} va être mentionné toutes les 20 secondes pendant 2 minutes.`
            });

            let count = 0;
            const interval = setInterval(async () => {
                if (count >= 6) {
                    clearInterval(interval);
                } else {
                    await interaction.channel.send(`${user}`);
                    count++;
                }
            }, 20000);
        } catch (error) {
            console.error('❌ Erreur lors de l\'exécution de la commande :', error);
            return await interaction.reply({
                content: "❌ Une erreur s'est produite lors du traitement de votre demande.",
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
