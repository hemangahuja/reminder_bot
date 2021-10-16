global.AbortController = require("node-abort-controller").AbortController;

require("dotenv").config();

const { readFileSync, writeFileSync } = require("fs");

const {
    Client,
    Intents: {
        FLAGS: { GUILDS, GUILD_MESSAGES },
    },
    MessageEmbed,
} = require("discord.js");

const client = new Client({
    intents: [GUILDS, GUILD_MESSAGES],
});

const prefix = "#";

const sleep = ms => new Promise(res => setTimeout(res, ms));

const getPersisted = () => {
    try {
        return JSON.parse(readFileSync("reminders.json").toString());
    } catch {
        return {};
    }
};

const persist = (time, data) => {
    const reminders = getPersisted();
    if (data) reminders[time] = data;
    else delete reminders[time];
    writeFileSync("reminders.json", JSON.stringify(reminders, null, 2));
};

client.once("ready", client => {
    console.log("bot started");
    Object.entries(getPersisted())
        .filter(([time]) => time > new Date().getTime())
        .forEach(([time, { event, channelId }]) => {
            client.channels.fetch(channelId).then(channel => {
                if (!channel.isText()) return;
                sleep(time - new Date().getTime()).then(() => {
                    channel.send({
                        embeds: [
                            new MessageEmbed().setDescription(
                                `Reminder: ${event}`
                            ),
                        ],
                    }).catch(noop => noop);
                    persist(time, undefined);
                });
            }).catch(noop => noop);
        });
});

client.on("messageCreate", async message => {
    if (!(message.content.startsWith(prefix) && message.guild)) return;
    const [CMD_Name, day, month, year, hour, minutes, event] = message.content
        .trim()
        .substring(prefix.length)
        .split(/\s+/);

    if (CMD_Name === "remind") {
        const time = new Date(year, month - 1, day, hour, minutes).getTime();
        const data = { event, channelId: message.channelId };
        persist(time, data);
        sleep(time - new Date().getTime()).then(() => {
            message.channel.send(`Reminder: ${event}`).catch(noop => noop);
            persist(time, undefined);
        });
        message.reply("Added reminder").catch(noop => noop);
    }

    if (CMD_Name === "delete") {
        const index = day;
        const time = Object.keys(getPersisted())[index - 1];
        persist(time, undefined);
    }
    if (CMD_Name === "show") {
        const toShow =
            Object.entries(getPersisted())
                .map(
                    ([time, event ], idx) =>
                        `**${idx + 1}.** ${new Date(
                            Number(time)
                        ).toLocaleString()} : ${event}`
                )
                .join("\n") || "There are no reminders set";

        message
            .reply({
                embeds: [new MessageEmbed().setDescription(toShow)],
            })
            .catch(noop => noop);
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);