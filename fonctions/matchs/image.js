const { createCanvas, loadImage } = require('canvas');

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

module.exports = {
    generateMatchImage
}