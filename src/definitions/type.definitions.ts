import { Types } from "mongoose";
import Subscriber from "../models/subscriber.model";

export type SubscriberType = {
    _id?: Types.ObjectId;
    channelId: string;
    channelName: string;
    guildId: string;
    guildName: string;
    subscriptionDate: Date;
    guildMemberCount: Number;
    subscribedCompanies: Types.ObjectId[];
};

export type CompanyType = {
    _id?: Types.ObjectId;
    name: string;
    suggestion: string;
    currentValue: number;
    suggestionDate: Date;
    expectedValue: number;
    potentialIncome: number;
    marketValue: number;
};

export type SubscriberInteraction = {
    channelId: string;
    channel: {
        name: string;
    };
    guildId: string;
    guild: {
        name: string;
        memberCount: number;
    };
};
