import Company from "../models/company.model";
import { AlreadySubscribedError, CompanyNotFoundError, NotSubscribedError } from "../definitions/error.definitions";
import { toObjectId } from "./formatter.utils";
import Subscriber from "../models/subscriber.model";
import { CompanyType, SubscriberInteraction, SubscriberType } from "../definitions/type.definitions";
import { CacheType, ChatInputCommandInteraction, TextChannel } from "discord.js";

export const handleSubscribe = async (interaction: SubscriberInteraction, companyName: string) => {
    const requestedCompany = await Company.findOne({ name: companyName });
    if (!requestedCompany) {
        throw new CompanyNotFoundError("Company not found!");
    }

    const subscriber = await Subscriber.findOne({ channelId: interaction.channelId });
    // if didn't subscribed to company yet,
    if (!subscriber) {
        const newSubscriber = new Subscriber({
            channelId: interaction.channelId,
            channelName: (interaction.channel as TextChannel).name,
            guildId: interaction.guildId,
            guildName: interaction.guild?.name,
            subscriptionDate: new Date(),
            guildMemberCount: interaction.guild?.memberCount,
            subscribedCompanies: [requestedCompany._id],
        });
        await newSubscriber.save();
        return true;
    } else {
        if (subscriber.subscribedCompanies.includes(requestedCompany._id)) {
            throw new AlreadySubscribedError("Already subscribed to company!");
        } else {
            subscriber.subscribedCompanies.push(requestedCompany._id);
            await subscriber.save();
            return true;
        }
    }
};

export const handleUnsubscribe = async (interaction: SubscriberInteraction, companyName: string) => {

    const requestedCompany = await Company.findOne({ name: companyName });
    if (!requestedCompany) {
        throw new CompanyNotFoundError("Company not found!");
    }

    const subscriber = await Subscriber.findOne({ channelId: interaction.channelId });
    if (!subscriber) {
        throw new NotSubscribedError("Not subscribed to company!");
    } else {
        if (subscriber.subscribedCompanies.includes(requestedCompany._id)) {
            subscriber.subscribedCompanies.splice(subscriber.subscribedCompanies.indexOf(requestedCompany._id), 1);
            await subscriber.save();
            return true;
        } else {
            throw new NotSubscribedError("Not subscribed to company!");
        }
    }
}


export const getCompany = async (companyName: string) => {
    const requestedCompany = await Company.findOne({ name: companyName });
    if (!requestedCompany) {
        throw new CompanyNotFoundError("Company not found!");
    } else {
        return requestedCompany;
    }
}

export const getAllSubscribersOfCompany = async (companyName: string) => {
    const requestedCompany = await Company.findOne({ name: companyName });
    if (!requestedCompany) {
        throw new CompanyNotFoundError("Company not found!");
    } else {
        const subscribers = await Subscriber.find({ subscribedCompanies: { $in : requestedCompany._id} });
        return subscribers;
    }
}


//update company
export const updateCompany = async (companyName: string, companyData: CompanyType) => {
    const requestedCompany = await Company.findOne({ name: companyName });
    if (!requestedCompany) {
        throw new CompanyNotFoundError("Company not found!");
    } else {
        requestedCompany.suggestion = companyData.suggestion;
        requestedCompany.currentValue = companyData.currentValue;
        requestedCompany.suggestionDate = companyData.suggestionDate;
        requestedCompany.expectedValue = companyData.expectedValue;
        requestedCompany.potentialIncome = companyData.potentialIncome;
        requestedCompany.marketValue = companyData.marketValue;
        await requestedCompany.save();
        return requestedCompany;
    }
}