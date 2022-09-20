import { ChatInputCommandInteraction, TextChannel } from "discord.js";
import { CompanyType, SubscriberInteraction } from "../definitions/type.definitions";
import Subscriber from "../models/subscriber.model";
import { handleUnsubscribe, handleSubscribe, getCompany } from "../utils/db.utils";
import { toCurrency } from "../utils/formatter.utils";
import { client } from "./rest_commands";

client.on("ready", () => {
    if (client.user) console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;
    const { commandName } = interaction;

    if (commandName == "subscribe-company") {
        const companyName = interaction.options.get("company_name", true).value as string;

        handleSubscribe(interaction as SubscriberInteraction, companyName)
            .then(() => {
                interaction.reply(`You have subscribed to **${companyName}** stock updates!`);
            })
            .catch((err: Error) => {
                console.log(err.name);
                console.log(err.message);
                err.name === "AlreadySubscribed"
                    ? interaction.reply(`You have already subscribed to **${companyName}** stock updates!`)
                    : err.name === "CompanyNotFound"
                    ? interaction.reply(`Company **${companyName}** not found!`)
                    : interaction.reply(`Something went wrong! Error Code: i-36 | Share with developer!`);
            });
    }

    if (commandName == "unsubscribe-company") {
        const companyName = interaction.options.get("company_name", true).value as string;

        handleUnsubscribe(interaction as SubscriberInteraction, companyName)
            .then(() => {
                interaction.reply(`You have unsubscribed from **${companyName}** stock updates!`);
            })
            .catch((err: Error) => {
                console.log(err.name);
                console.log(err.message);
                err.name === "NotSubscribed"
                    ? interaction.reply(`You have not subscribed to **${companyName}** stock updates!`)
                    : err.name === "CompanyNotFound"
                    ? interaction.reply(`Company **${companyName}** not found!`)
                    : interaction.reply(`Something went wrong! Error Code: i-47 | Share with developer!`);
            });
    }

    if (commandName == "stock-info") {
        const companyName = interaction.options.get("company_name", true).value as string;

        getCompany(companyName)
            .then((company: CompanyType) => {
                interaction.reply({
                    embeds: [
                        {
                            title: `${company.name} (${company.suggestion})`,
                            description: `Market Value: ${toCurrency(company.marketValue)}`,
                            fields: [
                                {
                                    name: "Current Value",
                                    value: `₺${toCurrency(company.currentValue)}`,
                                    inline: true,
                                },
                                {
                                    name: "Expected Value",
                                    value: `₺${toCurrency(company.expectedValue)}`,
                                    inline: true,
                                },
                                {
                                    name: "Potential Income",
                                    value: `${company.potentialIncome}%`,
                                    inline: true,
                                },
                            ],
                            color: 0x00ff00,
                            footer: {
                                text: `Suggestion Date: ${company.suggestionDate.toLocaleDateString("tr-TR")}`,
                            },
                        },
                    ],
                });
            })
            .catch((err: Error) => {
                console.log(err.name);
                console.log(err.message);
                err.name === "CompanyNotFound"
                    ? interaction.reply(`Company **${companyName}** not found!`)
                    : interaction.reply(`Something went wrong! Error Code: i-91 | Share with developer!`);
            });
    }
});

export default client;
