export interface MongoBody {
    dataSource: string;
    database: string;
    collection: string;
    documents: any[];
    urlApi?: string;
    apiKey?: string;
}

