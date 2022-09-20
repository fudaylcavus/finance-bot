import mongoose from "mongoose";
import { CompanyType } from "../definitions/type.definitions";

const companySchema = new mongoose.Schema<CompanyType>({
    name: String,
    expectedValue: Number,
    currentValue: Number,
    potentialIncome: Number,
    suggestion: String,
    suggestionDate: Date,
    marketValue: Number,
});



export default mongoose.model("Company", companySchema);
