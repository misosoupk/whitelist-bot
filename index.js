const {
    Client,
    GatewayIntentBits
} = require("discord.js");

const config = {
    token: "MTUzOTQzMzUzMzQzOTg2OTA0OQ.GvvWmz.igFI5IqktrbFFdvY0yUhJqODX-Tf75MLeUXKmw",

    guildId: "1385484520366669945",

    whitelistChannelId: "1538661419564925008",

    whitelistRoleId: "1538658861433749596",

    femaleVerificationChannelId: "1538677599075835974",

    minimumAccountAgeMonths: 6,

    reminderEveryMessages: 5,

    emojis: {
        approved: "<:PGreen:1540547108703178762>",
        pending: "<a:GREEN:1540547100188737656>",
        denied: "❎"
    },

    reminderEmojis: {
        greensos: "<a:greensos:1539806878463426632>",
        greenheartexclaim: "<a:greenheartexclaim:1539806858171383860>",
        kawaiiBowGreen: "<a:greenflyinghearts:1539806765049454682>",
        ieGreenArrows: "<a:ie_green_arrows:1540547106459095090>",
        greenCrown: "<a:GREEN_CROWN:1540547097407787120>",
        handshake: "<a:handshake:1539806680630562856>"
    },

   reminderImage:
    "https://cdn.discordapp.com/attachments/1236904936353304586/1541385470028816454/heightsnyc.png?ex=6a8d6695&is=6a8c1515&hm=2d92d2b14adb1603b629df0b90b27be0a8b7e310eeca5130d0a6029e39dc3fa5&"
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let messageCounter = 0;

function isAccountOldEnough(user) {
    const minimumDate = new Date();

    minimumDate.setMonth(
        minimumDate.getMonth() - config.minimumAccountAgeMonths
    );

    return user.createdAt <= minimumDate;
}

client.once("ready", () => {
    console.log(`Bot is online as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    // Only count messages in whitelist channel
    if (message.channel.id !== config.whitelistChannelId) return;

    // Count every message
    messageCounter++;

    console.log(
        `Whitelist channel message count: ${messageCounter}/${config.reminderEveryMessages}`
    );

    // Send reminder every 5 messages
    if (messageCounter >= config.reminderEveryMessages) {
        messageCounter = 0;

        const e = config.reminderEmojis;

        const reminder =
`*** Wanna get whitelisted? ${e.greensos} ***

> Just type **"wl"** right here in this channel and you’ll automatically receive the **Whitelist role** based on your Discord account age over **6 months**. You’ll either be accepted or declined for WL ${e.greenheartexclaim}

*** NYC Hotties ${e.kawaiiBowGreen} ***

If you’re a female player, looking to get verified to get access to all hotties exclusive channels and features, open a ***__Female Verification__*** ticket here. ${e.ieGreenArrows} <#${config.femaleVerificationChannelId}>

> This will give you access to exclusive sneak peeks and in-game benefits! ${e.greenCrown}

*** Status ${e.handshake} ***

${config.emojis.approved} = Whitelisted | ${config.emojis.denied} = Denied | ${config.emojis.pending} = Pending`;

        await message.channel.send({
            content: reminder,
            files: [config.reminderImage]
        });

        console.log("Whitelist reminder sent!");
    }

    // Check for WL / FWL
    const command = message.content.trim().toLowerCase();

    if (command !== "wl" && command !== "fwl") return;

    try {
        // Check account age
        if (!isAccountOldEnough(message.author)) {
            await message.react(config.emojis.denied);

            const reply = await message.reply(
                `${message.author} you are **NOT eligible for WL** yet. ❎\n\n` +
                `Your Discord account must be at least **6 months old** to be whitelisted.`
            );

            setTimeout(() => {
                reply.delete().catch(() => {});
            }, 2 * 60 * 1000);

            return;
        }

        const role = await message.guild.roles.fetch(
            config.whitelistRoleId
        );

        if (!role) {
            console.log("Whitelist role could not be found.");
            return;
        }

        // Give whitelist role
        await message.member.roles.add(role);

        // React approved
        await message.react(config.emojis.approved);

        if (command === "wl") {
            const reply = await message.reply(
                `${message.author} you are now **WHITELISTED**! ${config.emojis.approved}`
            );

            setTimeout(() => {
                reply.delete().catch(() => {});
            }, 2 * 60 * 1000);
        }

        if (command === "fwl") {
            const reply = await message.reply(
                `${message.author} you are now **WHITELISTED**! ${config.emojis.approved}\n\n` +
                `Please open a **Female Verification** ticket to receive your female role.\n` +
                `<#${config.femaleVerificationChannelId}>`
            );

            setTimeout(() => {
                reply.delete().catch(() => {});
            }, 2 * 60 * 1000);
        }

    } catch (error) {
        console.error("Whitelist error:", error);
    }
});

client.login(config.token);