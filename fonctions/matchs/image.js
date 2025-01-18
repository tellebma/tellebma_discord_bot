const { createCanvas, loadImage } = require('canvas');
const { format } = require('date-fns');
const { fr } = require('date-fns/locale');

async function generateMatchImage(match) {
    const canvas = createCanvas(600, 160);
    const ctx = canvas.getContext('2d');

    //ctx.fillStyle = '#ffff00';
    //ctx.fillRect(0, 0, canvas.width, canvas.height);

    const logoSize = 100;
    const vsSize = 60;
    const vsImage = 'https://upload.wikimedia.org/wikipedia/commons/7/70/Street_Fighter_VS_logo.png';

    const teamDomicileLogo = match.logoDomicile;
    const teamExterieurLogo = match.logoExterieur;

    if (teamDomicileLogo) {
        console.log(`teamDomicileLogo=${teamDomicileLogo}`)
        const homeLogo = await loadImage(teamDomicileLogo);
        ctx.drawImage(homeLogo, 50, (canvas.height - logoSize) / 2, logoSize, logoSize);
    }

    if (teamExterieurLogo) {
        console.log(`teamExterieurLogo=${teamExterieurLogo}`)
        const awayLogo = await loadImage(teamExterieurLogo);
        ctx.drawImage(awayLogo, canvas.width - 150, (canvas.height - logoSize) / 2, logoSize, logoSize);
    }

    const vsImg = await loadImage(vsImage);
    ctx.drawImage(vsImg, (canvas.width - vsSize) / 2, (canvas.height - vsSize) / 2, vsSize, vsSize);

    return canvas.toBuffer();
}
/*
async function generateScheduleImage(matches, date) {
    if (matches.length === 0) return null;

    const canvasWidth = 800;
    const rowHeight = 120;
    const canvasHeight = matches.length * rowHeight + 50;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Pas de fond coloré, laisse la transparence par défaut
    // ctx.fillStyle = '#ffffff'; // Pas de fond de couleur
    // ctx.fillRect(0, 0, canvas.width, canvas.height); 

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 30px Arial';
    const formattedDate = format(date, 'dd/MM/yy', { locale: fr });
    ctx.fillText(`Matches du ${formattedDate}`, 50, 40);

    const logoSize = 100;
    const vsSize = 80;
    const vsImage = 'https://upload.wikimedia.org/wikipedia/commons/7/70/Street_Fighter_VS_logo.png';

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const y = 50 + i * rowHeight;

        if (match.logoDomicile) {
            const homeLogo = await loadImage(match.logoDomicile);
            ctx.drawImage(homeLogo, 50, y, logoSize, logoSize);
        }

        if (match.logoExterieur) {
            const awayLogo = await loadImage(match.logoExterieur);
            ctx.drawImage(awayLogo, canvas.width - 150, y, logoSize, logoSize);
        }

        const vsImg = await loadImage(vsImage);
        ctx.drawImage(vsImg, (canvas.width - vsSize) / 2, y, vsSize, vsSize);
    }

    // Renvoie l'image au format PNG avec fond transparent
    return canvas.toBuffer('image/png'); // Précisez le format pour éviter les problèmes
}
*/

module.exports = {
    generateMatchImage
}