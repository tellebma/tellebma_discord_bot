const fs = require('fs');
const path = require('path');
const mute_data_path = path.join(__dirname, '../Shared_folder/mutes.json');
const { MessageFlags } = require("discord.js");
/**
 * Logger quand un message est créé
 * 
 * @param {GuildMember} message - Message qui a trigger cet event
 */
module.exports = {
    name: 'messageCreate',
    async execute(message) {
        try {
            if (message.author.bot) return;

            let muteData = {};
            if (fs.existsSync(mute_data_path)) {
                muteData = JSON.parse(fs.readFileSync(mute_data_path, 'utf8'));
            }

            if (muteData[message.author.id]) {
                if (Date.now() >= muteData[message.author.id].expiresAt) {
                    delete muteData[message.author.id];
                    fs.writeFileSync(mute_data_path, JSON.stringify(muteData, null, 4), 'utf8');
                    return;
                }

                const expirationDate = new Date(muteData[message.author.id].expiresAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                await message.delete();
                await message.channel.send({
                    content: `⏳ ${message.author.username}, vous êtes encore muté jusqu'au ${expirationDate}.`,
                    flags: MessageFlags.Ephemeral
                });
            }
        } catch (error) {
            console.error('❌Erreur lors de l\'event nouveau message:', error);
        }
    },
};
