import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { SlashCommandBuilder } from "@discordjs/builders";
const { DC_TOKEN, DC_APP_ID, DEV_SERVER_ID } = process.env;
import { Client, IntentsBitField } from "discord.js";

if (!DC_TOKEN || !DC_APP_ID || !DEV_SERVER_ID) {
    throw new Error("Missing environment variables!");
}


export const client = new Client({
    intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],
});

const getStockInfoCommand = new SlashCommandBuilder()
    .setName("stock-info")
    .setDescription("Get stock info of given company.")
    .addStringOption((option) =>
        option.setName("company_name").setDescription("Company name to get stock info?").setRequired(true)
    );

const subscribeCommand = new SlashCommandBuilder()
    .setName("subscribe-company")
    .setDescription("Subscribe to company to get notified of stock suggestion updates.")
    .addStringOption((option) =>
        option.setName("company_name").setDescription("Company name to subscribe stock info?").setRequired(true)
    );

const unsubCommand = new SlashCommandBuilder()
    .setName("unsubscribe-company")
    .setDescription("Unsubscribe from company stock suggestion updates")
    .addStringOption((option) =>
        option.setName("company_name").setDescription("Company name to subscribe stock info?").setRequired(true)
    );

const commands = [getStockInfoCommand.toJSON(), subscribeCommand.toJSON(), unsubCommand.toJSON()];

const rest = new REST({ version: "9" }).setToken(DC_TOKEN);

(async () => {
    try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(Routes.applicationGuildCommands(DC_APP_ID, DEV_SERVER_ID), { body: commands });

        await rest.put(Routes.applicationCommands(DC_APP_ID), {
            body: commands,
        });

        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }
})();
