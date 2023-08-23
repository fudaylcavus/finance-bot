import { CompanyType } from "../definitions/type.definitions";
import Company from "../models/company.model";

export async function isNewSuggestion(companyName: string, companiesData: CompanyType[]) {
    //check if companies data has different suggestion date for same copmany
    //if it has, return true
    //else return false
    const newCompanyData = companiesData.find((company) => company.name === companyName);

    let currentCompanyData: CompanyType | null = null;
    try {
        currentCompanyData = await Company.findOne({ name: companyName });
    } catch (err) {
        console.log('unknown company', companyName)
    }
    

    if (newCompanyData && currentCompanyData) {
        if (newCompanyData.suggestionDate.getTime() !== currentCompanyData.suggestionDate.getTime()) {
            return true;
        }
    }
    return false;
}
