/**
 * Map des permissions Discord vers leurs valeurs bitfield
 */
const PermissionsMap = {
    MANAGE_MESSAGES: 1 << 6,       // 64
    ADMINISTRATOR: 1 << 3,         // 8
    BAN_MEMBERS: 1 << 2,           // 4
    KICK_MEMBERS: 1 << 1,          // 2
    CREATE_INSTANT_INVITE: 1 << 0, // 1
};

/**
 * Retourne la valeur bitfield associée à une permission Discord
 * @param {string} permission - Le nom de la permission (ex : "MANAGE_MESSAGES").
 * @returns {number} La valeur bitfield associée ou 0 si la permission est invalide.
 */
function DiscordPermissionFlagsBits(permission) {
    // Retourner la valeur ou 0 par défaut
    return PermissionsMap[permission] || 0;
}

module.exports = {
    DiscordPermissionFlagsBits,
};
