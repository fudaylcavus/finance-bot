import axios, { AxiosResponse } from "axios";
import cheerio from "cheerio";
import { CompanyType } from "../definitions/type.definitions";
import { toNumber, toDate, toEnglish } from "./formatter.utils";

const URL = "https://www.isyatirim.com.tr/tr-tr/analiz/hisse/Sayfalar/takip-listesi.aspx";

async function getHTMLContent(url: string) {
    const siteData = await axios.get<string, AxiosResponse<string>>(url);

    if (siteData.status == 200) {
        return siteData.data;
    }
    return "";
}

function getCompaniesByHtmlContent(htmlContent: string): CompanyType[] {
    const $ = cheerio.load(htmlContent);
    const companies = new Array();

    $('table[data-csvname="takipozet"] tbody tr').each(function (i, elm) {
        const company: CompanyType = {
            name: $(this).children("td").eq(0).text(),
            suggestion: toEnglish({type: 'suggestion', value: $(this).children("td").eq(1).text()}),
            expectedValue: toNumber($(this).children("td").eq(2).text()),
            potentialIncome: toNumber($(this).children("td").eq(3).text()),
            suggestionDate: toDate($(this).children("td").eq(4).text()),
            currentValue: toNumber($(this).children("td").eq(5).text()),
            marketValue: toNumber($(this).children("td").eq(6).text()),
        };

        companies.push(company);
    });

    return companies;
}

export async function getCompanies(): Promise<CompanyType[]> {
    return getCompaniesByHtmlContent(await getHTMLContent(URL));
}

export function getCompanyInformation(companies: CompanyType[], companyName: string): CompanyType | undefined {
    return companies.find((company) => {
        return company.name.toLowerCase() === companyName.toLowerCase();
    });
}
