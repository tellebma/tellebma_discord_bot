const { createCommande } = require('../fonctions/commands/commandBuilder');
const { MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const commande_json_path = './commands/upload-torrent-command.json';
const commande = createCommande(commande_json_path);

const RUTORRENT_URL = 'http://your-rutorrent-server.com/plugins/httprpc/action.php';
const RUTORRENT_AUTH = { username: 'your-username', password: 'your-password' };

module.exports = {
    data: commande,
    async execute(interaction) {
        try {
            const file = interaction.options.getAttachment('file');
            if (!file || !file.name.endsWith('.torrent')) {
                return await interaction.reply({
                    content: "Veuillez fournir un fichier .torrent valide.",
                    flags: MessageFlags.Ephemeral
                });
            }

            const filePath = path.join(__dirname, '../temp/', file.name);
            const fileStream = fs.createWriteStream(filePath);
            const response = await axios.get(file.url, { responseType: 'stream' });
            response.data.pipe(fileStream);

            fileStream.on('finish', async () => {
                const form = new FormData();
                form.append('torrent_file', fs.createReadStream(filePath));
                
                try {
                    await axios.post(RUTORRENT_URL, form, {
                        auth: RUTORRENT_AUTH,
                        headers: form.getHeaders()
                    });

                    fs.unlinkSync(filePath);
                    await interaction.reply({
                        content: `Le fichier ${file.name} a été téléchargé avec succès sur ruTorrent.`
                    });
                } catch (uploadError) {
                    console.error('Erreur lors de l'upload sur ruTorrent:', uploadError);
                    await interaction.reply({
                        content: "Échec du téléversement du fichier sur ruTorrent.",
                        flags: MessageFlags.Ephemeral
                    });
                }
            });
        } catch (error) {
            console.error('Erreur lors de l'exécution de la commande :', error);
            return await interaction.reply({
                content: "Une erreur s'est produite lors du traitement de votre demande.",
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
