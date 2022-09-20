import { Types } from "mongoose";

export function toDate(date: string): Date {
    const [day, month, year] = date.split(".");
    return new Date(`${month}/${day}/${year}`);
}

export function toNumber(amount: string): number {
    let amountWithDeletedDots = amount.replace(/\./g, "");
    return Number(amountWithDeletedDots.replace(/,/gi, "."));
}


export function toCurrency(amount: number): string {
    console.log(amount)
    let amountString = amount.toString();
    let amountArray = amountString.split(".");
    let amountInteger = amountArray[0];
    let amountDecimal = amountArray[1] || "00";
    let amountIntegerArray = amountInteger.split("");
    let amountIntegerArrayReversed = amountIntegerArray.reverse();
    let amountIntegerArrayReversedWithDots = [];
    for (let i = 0; i < amountIntegerArrayReversed.length; i++) {
        if (i % 3 == 0 && i != 0) {

            amountIntegerArrayReversedWithDots.push(".");
        }
        amountIntegerArrayReversedWithDots.push(amountIntegerArrayReversed[i]);
    }

    let amountIntegerArrayReversedWithDotsReversed = amountIntegerArrayReversedWithDots.reverse();
    let amountIntegerWithDots = amountIntegerArrayReversedWithDotsReversed.join("");
    let amountWithDots = amountIntegerWithDots + "," + amountDecimal;
    return amountWithDots;
}





export const toObjectId = (id: string) => new Types.ObjectId(id);