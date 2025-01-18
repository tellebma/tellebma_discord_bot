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
            //console.log(message)
        } catch (error) {
            console.error('Erreur lors de l\'event nouveau message:', error);
        }
    },
};
