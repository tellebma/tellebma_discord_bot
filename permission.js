const { PermissionsBitField } = require('discord.js');

/**
 * Map des permissions Discord vers leurs valeurs bitfield
 */
const PermissionsMap = {
    MANAGE_MESSAGES: PermissionsBitField.Flags.ManageMessages,
    ADMINISTRATOR: PermissionsBitField.Flags.Administrator,
    BAN_MEMBERS: PermissionsBitField.Flags.BanMembers,
    KICK_MEMBERS: PermissionsBitField.Flags.KickMembers,
    CREATE_INSTANT_INVITE: PermissionsBitField.Flags.CreateInstantInvite,
};

/**
 * Retourne la valeur bitfield associée à une permission Discord
 * @param {string} permission - Le nom de la permission (ex : "MANAGE_MESSAGES").
 * @returns {bigint} La valeur bitfield associée ou 0n si la permission est invalide.
 */
function DiscordPermissionFlagsBits(permission) {
    return PermissionsMap[permission] ?? 0n; // Utilisation de 0n pour éviter les erreurs sur les bitfields
}

module.exports = {
    DiscordPermissionFlagsBits,
};
