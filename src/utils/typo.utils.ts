import stringSimilarity from "string-similarity";
import { MEM_COMPANY_LIST } from "../../server";

export const getCompanyWithTypo = (companyName: string) => {
    return stringSimilarity.findBestMatch(companyName, MEM_COMPANY_LIST).bestMatch.target;
};
