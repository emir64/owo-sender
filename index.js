const { Client, MessageActionRow, MessageButton } = require('discord.js-selfbot-v13');
const fs = require('fs');
const config = require("./config.json")

async function start(token) {
    return new Promise((resolve, reject) => {
        try {
            const client = new Client({ checkUpdate: false });
            client.login(token).catch(reject);

            client.on("ready", () => {
                console.log(`[$] Online - ${client.user.username}`);
                const channel = client.channels.cache.get(config["channel_id"])
                channel.send("owo cash");
                const filter = m => m.author.id == config["owo_id"]
                const collector = channel.createMessageCollector({ filter, max: 1, time: 10_000 })
                collector.on("collect", async (msg) => {
                    const content = msg.content;
                    const regex = /<:cowoncy:416043450337853441>.*?, you currently have \*\*__(\d{1,3}(?:,\d{3})*)__ cowoncy!\*\*/;
                    const matches = content.match(regex);
                    if (matches && matches[1]) {
                        const cash = parseInt(matches[1].replace(/,/g, ''));
                        console.log(`[+] OwO Cash Bulundu: ${cash.toLocaleString()}`);
                        if (config["auto_send"] == true) {
                            if (cash < config["per_token_per_cash"]) return;
                            client.channels.cache.get(config["channel_id"]).send(`owo send <@${config["target_user"]}> ${config["per_token_per_cash"] == "all" ? cash : config["per_token_per_cash"] }`).catch(console.error);
                            const filter = (m) => m.author.id === config["owo_id"] && m.embeds && m.components.length;
                            const collector = msg.channel.createMessageCollector({ filter, max: 5, time: 10_000 });
                            collector.on("collect", async (m) => {
                                if (m.author.id === config["owo_id"]) await m.clickButton({ row: 0, col: 0 });
                            });
                            console.log(`[>] OwO cash gönderildi > ${config["target_user"]} (${config["per_token_per_cash"].toLocaleString()})`);

                        }
                        resolve(cash);
                    } else {
                        console.log(`[!] OwO Cash Ölçülemedi - ${client.user.username}`);
                    }
                });
            })

        } catch (err) {
            console.error(`[!] Hata: ${err}`);
            reject(err);
        }
})
}

async function main() {
    console.clear();
    const tokens = fs.readFileSync("tokens.txt", "utf-8").split("\n").map(token =>  token.trim());
    console.log(`[+] Toplam ${tokens.length} token bulundu`);
    console.log("[+] OwO Cash ölçülüyor...");
    
    let totalCash = 0;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const cash = await start(token).catch(console.error);
        totalCash += cash;
        if (i < tokens.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    
    console.log(`[+] Toplam OwO Cash: ${totalCash.toLocaleString()}`);
}

(async () => {
    await main()
})();