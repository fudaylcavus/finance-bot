import mongoose from 'mongoose';
import { SubscriberType } from '../definitions/type.definitions';

const subscriberSchema = new mongoose.Schema<SubscriberType> ({
    channelId: String,
    channelName: String,
    guildId: String,
    guildName: String,
    subscriptionDate: Date,
    guildMemberCount: Number,
    subscribedCompanies: [{ref: "Company", type: mongoose.Schema.Types.ObjectId}],
});

export default mongoose.model("Subscriber", subscriberSchema);