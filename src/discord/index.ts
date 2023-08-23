import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder } from "discord.js";
import { mainControlFunction } from "../../server";
import { CompanyType, SubscriberInteraction } from "../definitions/type.definitions";
import { handleUnsubscribe, handleSubscribe, getCompany } from "../utils/db.utils";
import { toCurrency } from "../utils/formatter.utils";
import { getCompanyWithTypo } from "../utils/typo.utils";
import { client } from "./rest_commands";

let lastManualRefresh: Date | null = null;

function getCompanyEmbed(company: CompanyType) {
    return {
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
    };
}

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
                    embeds: [getCompanyEmbed(company)],
                });
            })
            .catch(async (err: Error) => {
                const possibleCompany = getCompanyWithTypo(companyName);
                console.log(err.name);
                console.log(err.message);

                if (err.name === "CompanyNotFound") {
                    const yesButton = new ButtonBuilder()
                        .setCustomId("yes")
                        .setLabel("Yes")
                        .setStyle(ButtonStyle.Success)
                        .setEmoji("✅");

                    const noButton = new ButtonBuilder()
                        .setCustomId("no")
                        .setLabel("No")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("❌");

                    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                        yesButton,
                        noButton
                    );
                    const collectorFilter = (i: any) => i.user.id === interaction.user.id;

                    const response = await interaction.reply({
                        content: `Company ${companyName} not found!\nDid you mean: **${possibleCompany}**?`,
                        components: [row],
                    });

                    try {
                        const confirmation: any = await response.awaitMessageComponent({
                            filter: collectorFilter,
                            time: 15000,
                        });

                        if (confirmation.customId === "yes") {
                            getCompany(possibleCompany)
                                .then((company: CompanyType) => {
                                    interaction.editReply({
                                        embeds: [getCompanyEmbed(company)],
                                        components: [],
                                    });
                                })
                                .catch((err: Error) => {
                                    interaction.editReply(
                                        `Something went wrong! Error Code: i-138 | Share with developer!`
                                    );
                                });
                        } else if (confirmation.customId === "no") {
                            await confirmation.update({ content: "Action cancelled", components: [] });
                        }
                    } catch (e) {
                        await interaction.deleteReply();
                    }

                    return;
                }
                // await interaction.reply({
                //     content: `Are you sure you want to ban ${target} for reason: ${reason}?`,
                //     components: [row],
                // });
                //if company not found, ask if user meant one of the possible companies

                interaction.reply(`Something went wrong! Error Code: i-91 | Share with developer!`);
            });
    }

    if (commandName == "refresh-data") {
        if (lastManualRefresh && Date.now() - lastManualRefresh.getTime() < 1000 * 60 * 60 * 24) {
            interaction.reply(":warning: You can only refresh data *once a day*!");
            return;
        }
        interaction.reply(":arrows_counterclockwise: Data refresh started!");
        mainControlFunction()
            .then(() => {
                interaction.editReply(":white_check_mark: Data refresh completed!");
                lastManualRefresh = new Date();
            })
            .catch((err: Error) => {
                console.log(err.name);
                console.log(err.message);
                interaction.editReply(":warning: Something went wrong! Error Code: i-104 | Share with developer!");
            });
    }
});

export default client;
