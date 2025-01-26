const { EmbedBuilder, MessageFlags } = require('discord.js');
const { createCommande } = require('../fonctions/commands/commandBuilder');
const { fetchPlayerInfoCompet } = require('../fonctions/api/matchs')

// Charger les données de la commande depuis le fichier JSON
const commande_json_path = './commands/playerInfo-command.json';
const commande = createCommande(commande_json_path);

/**
 * { "name": "Fortnite - Malibuca", "value":"Malibuca" },
          { "name": "LOL Div2 - Tao", "value":"Tao" },
          { "name": "LOL Div2 - Baashh", "value":"Baashh" },
          { "name": "LOL Div2 - MathisV", "value":"MathisV" },
          { "name": "LOL Div2 - Hazel", "value":"Hazel" },
          { "name": "LOL Div2 - Nsurr", "value":"Nsurr" },
          { "name": "LOL Div2 - CptMario", "value":"CptMario" },
          { "name": "LOL Div2 - Lingwi", "value":"Lingwi" },
          { "name": "LOL LEC - Canna", "value":"Canna" },
          { "name": "LOL LEC - Yike", "value":"Yike" },
          { "name": "LOL LEC - Vladi", "value":"Vladi" },
          { "name": "LOL LEC - Caliste", "value":"Caliste" },
          { "name": "LOL LEC - Targamas", "value":"Targamas" },
          { "name": "LOL LEC - Reha", "value":"Reha" },
          { "name": "LOL LEC - Wadi", "value":"Wadi" },
          { "name": "LOL LEC - Apples", "value":"Apples" },
          { "name": "LOL LEC - Clement", "value":"Clement" },
          { "name": "LOL LEC - Bo", "value":"Bo" },
          { "name": "LOL LFL - Maynter", "value":"Maynter" },
          { "name": "LOL LFL - Boukada", "value":"Boukada" },
          { "name": "LOL LFL - SlowQ", "value":"SlowQ" },
          { "name": "LOL LFL - 3XA", "value":"3XA" },
          { "name": "LOL LFL - Piero", "value":"Piero" },
          { "name": "LOL LFL - TheRock", "value":"TheRock" },
          { "name": "LOL LFL - Blidzy", "value":"Blidzy" },
          { "name": "RL - Vatira", "value":"Vatira" },
          { "name": "RL - Atow", "value":"Atow" },
          { "name": "RL - Dralii", "value":"Dralii" },
          { "name": "RL - Ferra", "value":"Ferra" },
          { "name": "Tekken8StreetFighter6 - Kilzyou", "value":"Kilzyou" },
          { "name": "Tekken8StreetFighter6 - GEN1US", "value":"GEN1US" },
          { "name": "TFT - Canbizz", "value":"Canbizz" },
          { "name": "TFT - Double61", "value":"Double61" },
          { "name": "TrackMania - Otaaaq", "value":"Otaaaq" },
          { "name": "Valorant VCL - f4ngeer", "value":"f4ngeer" },
          { "name": "Valorant VCL - Soren", "value":"Soren" },
          { "name": "Valorant VCL - Sevire", "value":"Sevire" },
          { "name": "Valorant VCL - Ease", "value":"Ease" },
          { "name": "Valorant VCL - Yohpa", "value":"Yohpa" },
          { "name": "Valorant VCL - Pakko", "value":"Pakko" },
          { "name": "Valorant VCT - Saadhak", "value":"Saadhak" },
          { "name": "Valorant VCT - Avez", "value":"Avez" },
          { "name": "Valorant VCT - Elite", "value":"Elite" },
          { "name": "Valorant VCT - Marteen", "value":"Marteen" },
          { "name": "Valorant VCT - Suygetsu", "value":"Suygetsu" },
          { "name": "Valorant VCT - Engh", "value":"Engh" },
          { "name": "Valorant VCT - Fistie", "value":"Fistie" },
          { "name": "Valorant VCT - ZE1SH", "value":"ZE1SH" },
          { "name": "Valorant VCT - Magnum", "value":"Magnum" },
          { "name": "Valorant VCT GC - Glance", "value":"Glance" },
          { "name": "Valorant VCT GC - LaAwAlkyia", "value":"LaAwAlkyia" },
          { "name": "Valorant VCT GC - Anesilia", "value":"Anesilia" },
          { "name": "Valorant VCT GC - Safiaa", "value":"Safiaa" },
          { "name": "Valorant VCT GC - Jiex", "value":"Jiex" },
          { "name": "Valorant VCT GC - Smartseven", "value":"Smartseven" }
 */
module.exports = {
    data: commande,
    async execute(interaction) {
        try {
            const compet = interaction.options.getString('competition');
            players = await fetchPlayerInfoCompet(compet);
            let embeds = [];
            for (let index = 0; index < players.length; index++) {
                const player = players[index];
                embeds.push(new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(player.friendly_name)
                    .setURL(`https://www.twitch.tv/${player.twitch_login}`)
                    .setDescription(`🎮 Jeu: ${player.category_game}`)
                    .setThumbnail(player.twitch_picture)
                    .addFields(
                        { name: 'Twitch', value: player.twitch_login !== 'undefined_player' ? `[${player.twitch_login}](https://www.twitch.tv/${player.twitch_login})` : 'Pas de chaine twitch', inline: true },
                        { name: 'Identifiant', value: player.twitch_identifier, inline: true }
                    )); 
            }
            await interaction.reply({ embeds: embeds });
            return;
            

        } catch (error) {
            console.error('❌Erreur lors de l\'exécution de la commande :', error);
            return await interaction.reply({
                content: "❌Une erreur s'est produite lors du traitement de votre demande.",
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
