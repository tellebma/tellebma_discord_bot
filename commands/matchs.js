const { createCommande } = require('../fonctions/commands/commandBuilder');
const { filterMatchesByDate } = require('../fonctions/api/matchs');
const { generateMatchImage } = require('../fonctions/matchs/image');
const { EmbedBuilder, MessageFlags } = require('discord.js');
const { parse, isBefore, format } = require('date-fns');
const { fr } = require('date-fns/locale');

// Charger les données de la commande depuis le fichier JSON
const commande_json_path = './commands/matchs-command.json';
const commande = createCommande(commande_json_path);

module.exports = {
    data: commande,
    async execute(interaction) {
        try {
            // Récupération des options
            const dateString = interaction.options.getString('date'); // format dd/MM/yy
            const today = new Date().setHours(0, 0, 0, 0);
            let date;

            if (dateString) {
                // Convertir la chaîne de date en objet Date
                date = parse(dateString, 'dd/MM/yy', new Date(), { locale: fr });

                // Vérifier si la date est antérieure à aujourd'hui
                if (isBefore(date, today)) {
                    return await interaction.reply({
                        content: "Erreur : La date ne peut pas être antérieure à aujourd'hui.",
                        flags: MessageFlags.Ephemeral
                    });
                }
            } else {
                // Si aucune date n'est fournie, prendre la date du jour
                date = today;
            }

            // Formater la date pour affichage
            const formattedDate = format(date, 'dd/MM/yy', { locale: fr });

            // Récupérer les matchs du jour
            try {
                const matchs = await filterMatchesByDate(date);
    
                // Vérifier s'il n'y a pas de matchs
                if (matchs.length === 0) {
                    // Si aucun match n'est trouvé, renvoyer un message d'erreur ou une image par défaut
                    return await interaction.reply({
                        content: `Aucun match trouvé pour la date ${formattedDate}.`,
                        flags: MessageFlags.Ephemeral
                    });
                }
                let embeds = [];
                let attachments = [];
                let match;
                let imageBuffer;
                for (let index = 0; index < matchs.length; index++) {
                    match = matchs[index];
                    embeds.push(new EmbedBuilder()
                        .setTitle(match.title)
                        .setThumbnail(`attachment://gameIconUrl${index}.png`)
                        .setDescription(`**Compétition :** [${match.compet_clean}](${match.link})\n**Jeu :** ${match.game}`)
                        .addFields(
                            { name: `   ${match.teamDomicile}`, value: ` `, inline: true },
                            { name: '   Contre', value: ' ', inline: true },
                            { name: `   ${match.teamExterieur}`, value: ` `, inline: true },
                        )
                        .setImage(`attachment://match${index}.png`)
                        .setFooter({ text: `Date : ${format(match.start, "EEEE dd MMMM yyyy HH:mm", { locale: fr })}` })
                        .setURL(match.streamLink)
                        .setColor(match.color));
                    imageBuffer = await generateMatchImage(match);
                    attachments.push({ attachment: match.gameIconURL, name: `gameIconUrl${index}.png` })
                    attachments.push({ attachment: imageBuffer, name: `match${index}.png` })
                }
                
                return await interaction.reply({
                    content: "Voici les matchs du jour :",
                    embeds: embeds,
                    files: attachments
                });
            } catch (error) {
                // Si aucun match n'est trouvé, envoyer un message d'erreur
                console.error('Erreur lors de la récupération des matchs :', error);
                return await interaction.reply({
                    content: `Aucun match trouvé pour la date ${formattedDate}.`,
                    flags: MessageFlags.Ephemeral
                });
            }

        } catch (error) {
            console.error('Erreur lors de l\'exécution de la commande :', error);
            return await interaction.reply({
                content: "Une erreur s'est produite lors du traitement de votre demande.",
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
