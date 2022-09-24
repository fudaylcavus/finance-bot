import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import DiscordClient from "./src/discord";
import Company from "./src/models/company.model";
import { CompanyType, SubscriberType } from "./src/definitions/type.definitions";
import { getCompanies } from "./src/utils/parser.utils";
import { isNewSuggestion } from "./src/utils/notification.utils";
import { getAllSubscribersOfCompany, updateCompany } from "./src/utils/db.utils";
import { TextChannel } from "discord.js";


const MONGO_URI: string = process.env.MONGO_CONNECTION_STRING as string;

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        Company.find({}, (err: any, data: CompanyType[]) => {
            if (err) {
                console.log(err);
            } else {
                if (data.length === 0) {
                    console.log("No data found in database. Fetching initial data from www.isyatirim.com.tr...");
                    getCompanies()
                        .then((companies: CompanyType[]) => {
                            Company.insertMany(companies, (err: any) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log("Initial data fetched and saved to database.");
                                }
                            });
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                }
            }
        });
    })
    .catch((error: any) => {
        console.error("Error while connecting to MongoDB:", error.message);
    });

//check every week, if suggestion date of any company is changed
//then send message to all subscribers of that company
setInterval(async () => {
    const newData = await getCompanies();
    for (const company of newData) {
        if (await isNewSuggestion(company.name, newData)) {
            const subscribers = await getAllSubscribersOfCompany(company.name);
            for (const subscriber of subscribers) {
                const channel = await DiscordClient.channels.fetch(subscriber.channelId);
                if (channel instanceof TextChannel) {
                    channel.send(`**${company.name}** hissesi için yeni öneri: ${company.suggestion}`);
                }
            }
            updateCompany(company.name, company);
        }
    }
}, 1000 * 60 * 60 * 24 * 7);

DiscordClient.login(process.env.DC_TOKEN);
