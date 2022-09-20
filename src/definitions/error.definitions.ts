export class CompanyNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CompanyNotFound";
    }
}


export class AlreadySubscribedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AlreadySubscribed";
    }
}

export class NotSubscribedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotSubscribed";
    }
}