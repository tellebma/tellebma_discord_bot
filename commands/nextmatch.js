const { EmbedBuilder, MessageFlags } = require('discord.js');
const { createCommande } = require('../fonctions/commands/commandBuilder');
const { addDetailOnMatches } = require('../fonctions/matchs/utils')
const { getNextMatch } = require('../fonctions/database/matchs')
const { generateMatchImage } = require('../fonctions/matchs/image');
const { format } = require('date-fns');
const { fr } = require('date-fns/locale');

// Charger les données de la commande depuis le fichier JSON
const commande_json_path = './commands/nextmatch-command.json';
const commande = createCommande(commande_json_path);

module.exports = {
    data: commande,
    async execute(interaction) {
        try {
            const jeu = interaction.options.getString('jeu');
            const compet = interaction.options.getString('competition');

            console.log(`nextmatch - ${jeu} - ${compet}`)
            let match = await getNextMatch(jeu, compet);
            console.log(match.id);
            match = addDetailOnMatches([match])[0];
            console.log(match.id);
            if (!match) {
                return await interaction.reply({ content: "Aucun match trouvé pour ces critères.", flags: MessageFlags.Ephemeral });
            }

            // Générer l'image du match
            const imageBuffer = await generateMatchImage(match);

            // Créer l'embed Discord
            const embed = new EmbedBuilder()
                .setTitle(match.title)
                .setThumbnail(`attachment://gameIconUrl.png`)
                .setDescription(`**Compétition :** [${match.compet_clean}](${match.link})\n**Jeu :** ${match.game}`)
                .setImage(`attachment://match.png`)
                .setFooter({ text: `Date : ${format(match.start, "EEEE dd MMMM yyyy HH:mm", { locale: fr })}` })
                .setURL(match.streamLink)
                .setColor(match.color);
            if (match.teamDomicile){
                embed.addFields(
                    { name: ` ${match.teamDomicile}`, value: ` `, inline: true },
                    { name: ' Contre', value: ' ', inline: true },
                    { name: ` ${match.teamExterieur}`, value: ` `, inline: true },
                );
            } else {
                embed.addFields(
                    { name: ` `, value: ` `, inline: true },
                    { name: ` ${match.player}`, value: ' ', inline: true },
                    { name: ` `, value: ` `, inline: true },
            );
            }
            // Envoyer l'embed avec l'image
            return await interaction.reply({
                embeds: [embed],
                files: [{ attachment: match.gameIconURL, name: `gameIconUrl.png` }, { attachment: imageBuffer, name: `match.png` }],
                flags: MessageFlags.Ephemeral
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
