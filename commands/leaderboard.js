const { EmbedBuilder, MessageFlags } = require('discord.js');
const { createCommande } = require('../fonctions/commands/commandBuilder');
const { fetchScoreInfo } = require('../fonctions/api/matchs')

// Charger les données de la commande depuis le fichier JSON
const commande_json_path = './commands/leaderboard-command.json';
const commande = createCommande(commande_json_path);

module.exports = {
    data: commande,
    async execute(interaction) {
        try {
            const competition = interaction.options.getString('team');
            const rawTeams = await fetchScoreInfo(competition);

            if (!rawTeams || rawTeams.length === 0) {
                return interaction.reply({ content: 'Aucune équipe trouvée pour cette compétition.', ephemeral: true });
            }

            // Extraire les objets d'équipe des tableaux
            const teams = rawTeams.flat().map(team => ({
                ...team,
                wins: parseInt(team.score.split(';')[0], 10),
                losses: parseInt(team.score.split(';')[1], 10)
            }));

            // Trier par victoires décroissantes, puis défaites croissantes
            const sortedTeams = teams.sort((a, b) => b.wins - a.wins || a.losses - b.losses);

            const emojis = ['🥇', '🥈', '🥉'];

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`Leaderboard - ${competition}`)
                .setDescription('Classement des équipes par score')
                .addFields(
                    sortedTeams.map((team, index) => ({
                        name: `${index < 3 ? emojis[index] : `#${index + 1}`} - ${team.team.includes('Karmine Corp') ? `🔥 **${team.team}** 🔥` : team.team}`,
                        value: `Score: **${team.wins} - ${team.losses}**`,
                        inline: false
                    }))
                )
                .setFooter({ text: 'Dernière mise à jour des scores' });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('❌Erreur lors de l\'exécution de la commande :', error);
            return await interaction.reply({
                content: "❌Une erreur s'est produite lors du traitement de votre demande.",
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
