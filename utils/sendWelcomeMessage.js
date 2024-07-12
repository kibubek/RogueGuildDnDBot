const { EmbedBuilder } = require('discord.js');

function sendWelcomeMessage(member, NEWCOMMER_CHANNEL_ID) {
    const welcomeMessages = [
        `*Vítej, statečný hrdino, do světa temnot, kde číhá dobrodružství, <@${member.id}>!*`,
        `*Zdravíme tě, nová duše, vítězství je na dosah ruky, <@${member.id}>!*`,
        `*Ahoj, odvážný reku, čekají tě boje a sláva, <@${member.id}>!*`,
        `*Je skvělé tě mít zde, bojovníku, zlato a sláva jsou tvá, <@${member.id}>!*`,
        `*Vítej, nová sílo, v hlubinách najdeš své místo, <@${member.id}>!*`,
        `*Přicházíš s nadějí, srdce tvé je plné odvahy, <@${member.id}>!*`,
        `*Dobrodruhu, vítej zde, poklady čekají na tebe, <@${member.id}>!*`,
        `*Vítáme tě v naší říši, kde odvaha je klíčem k přežití, <@${member.id}>!*`,
        `*Do světa kouzel a zázraků, vítáme tě, <@${member.id}>!*`,
        `*Statečný poutníku, otevři oči, nové příběhy čekají, <@${member.id}>!*`,
        `*S mečem v ruce, vítáme tě, <@${member.id}>!*`,
        `*Kroniky slávy čekají, hrdino, tvé jméno zapíší, <@${member.id}>!*`,
        `*Do hlubin temných kobek tě zveme, odvážný reku, <@${member.id}>!*`,
        `*V království stínů jsi vítán, kde každý boj je zkouškou, <@${member.id}>!*`,
        `*Sílou a odvahou vítězství dosáhneš, <@${member.id}>!*`,
        `*Nový den, nový boj, vítej mezi nás, <@${member.id}>!*`,
        `*Hrdino, cesta před tebou je dlouhá, ale sláva čeká, <@${member.id}>!*`,
        `*V království kouzel a mocných čar, vítáme tě, <@${member.id}>!*`,
        `*Do epických bitev vstupuješ, odvážný bojovníku, <@${member.id}>!*`,
        `*Tvé dobrodružství začíná zde, vítej v našich řadách, <@${member.id}>!*`
    ];
    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    const guildIconURL = member.guild.iconURL({ dynamic: true, size: 1024 });
    const embed = new EmbedBuilder()
        .setTitle('Právě se připojil nový člen!')
        .setDescription(randomMessage)
        .setThumbnail(member.user.displayAvatarURL())
        .setColor('#920422')
        .setFooter({ text: 'Dark And Darker CZ/SK', iconURL: guildIconURL });

    const channel = member.guild.channels.cache.get(NEWCOMMER_CHANNEL_ID);
    if (channel) {
        channel.send({ embeds: [embed] });
    }
}

module.exports = { sendWelcomeMessage };
