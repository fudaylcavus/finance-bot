import mongoose from "mongoose";
import { describe, expect, test, beforeAll, afterAll } from "@jest/globals";
import { CompanyType } from "../definitions/type.definitions";
import Subscriber from "../models/subscriber.model";
import { handleSubscribe, handleUnsubscribe } from "../utils/db.utils";
import dotenv from "dotenv";
dotenv.config();

// ensure env variables are defined
if (!process.env.MONGO_CONNECTION_STRING) {
    console.error("MONGO_CONNECTION_STRING is not defined");
    throw new Error("MONGO_CONNECTION_STRING is not defined");
}

describe("handleSubscribe Function", () => {
    beforeAll(async () => {
        await mongoose
            .connect(process.env.MONGO_CONNECTION_STRING || "")
            .catch((err) => {
                console.error(err);
            })
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test("it should subscribe to channel", async () => {
        const TEST_INTERACTION = {
            channelId: `${new Date().getTime()}`,
            channel: {
                name: "test-channel",
            },
            guildId: "123",
            guild: {
                name: "test-guild",
                memberCount: 123,
            },
        };

        let isSucceed = await handleSubscribe(TEST_INTERACTION, "ASELS");
        expect(isSucceed).toBe(true);

        if (isSucceed) {
            const subscriber = await Subscriber.findOne({ channelId: TEST_INTERACTION.channelId }).populate<CompanyType>(
                "subscribedCompanies"
            );
            expect(subscriber).not.toBeNull();
            if (subscriber) {
                expect(subscriber.subscribedCompanies).toContainEqual(expect.objectContaining({ name: "ASELS" }));
            }
        }
    });

    test("it should raise an appropriate error if already subscribed", async () => {
        const TEST_INTERACTION = {
            channelId: `${new Date().getTime()}`,
            channel: {
                name: "test-channel",
            },
            guildId: "123",
            guild: {
                name: "test-guild",
                memberCount: 123,
            },
        };

        let isSucceed = await handleSubscribe(TEST_INTERACTION, "ASELS");
        expect(isSucceed).toBe(true);

        await handleSubscribe(TEST_INTERACTION, "ASELS")
            .then((result) => {
                expect(result).toBe(false);
            })
            .catch((err) => {
                expect(err.name).toBe("AlreadySubscribed");
            });
    });

    test("it should raise an appropriate error if company does not exist", async () => {
        const TEST_INTERACTION = {
            channelId: `${new Date().getTime()}`,
            channel: {
                name: "test-channel",
            },
            guildId: "123",
            guild: {
                name: "test-guild",
                memberCount: 123,
            },
        };

        await handleSubscribe(TEST_INTERACTION, "TEST")
            .then((result) => {
                expect(result).toBe(false);
            })
            .catch((err) => {
                expect(err.name).toBe("CompanyNotFound");
            });
    });
});

describe("handleUnsubscribe Function", () => {
    beforeAll(async () => {
        await mongoose
            .connect(process.env.MONGO_CONNECTION_STRING|| "")
            .catch((err) => {
                console.error(err);
            })
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test("it should unsubscribe from channel", async () => {
        const TEST_INTERACTION = {
            channelId: `${new Date().getTime()}`,
            channel: {
                name: "test-channel",
            },
            guildId: "123",
            guild: {
                name: "test-guild",
                memberCount: 123,
            },
        };

        await handleSubscribe(TEST_INTERACTION, "ASELS").catch((err) => {
            console.error(err.name);
            console.error(err.message);
        });

        await handleUnsubscribe(TEST_INTERACTION, "ASELS")
            .then((result) => {
                expect(result).toBe(true);
            })
            .catch((err) => {
                expect(err).toBeUndefined();
            });
    });

    test("it should raise an appropriate error if not subscribed", async () => {
        const TEST_INTERACTION = {
            channelId: `${new Date().getTime()}`,
            channel: {
                name: "test-channel",
            },
            guildId: "123",
            guild: {
                name: "test-guild",
                memberCount: 123,
            },
        };

        await handleUnsubscribe(TEST_INTERACTION, "ASELS")
            .then((result) => {
                expect(result).toBe(false);
            })
            .catch((err) => {
                expect(err.name).toBe("NotSubscribed");
            });
    });

    test("it should raise an appropriate error if company does not exist", async () => {
        const TEST_INTERACTION = {
            channelId: `${new Date().getTime()}`,
            channel: {
                name: "test-channel",
            },
            guildId: "123",
            guild: {
                name: "test-guild",
                memberCount: 123,
            },
        };

        await handleUnsubscribe(TEST_INTERACTION, "TEST")
            .then((result) => {
                expect(result).toBe(false);
            })
            .catch((err) => {
                expect(err.name).toBe("CompanyNotFound");
            });
    });
});