export interface OpenaiBody {
    messages: Message[];
    model: string;
    seed: number;
    temperature: number;
    response_format: any;
    jsonArchitecture?: string;
    instruction?: string;
    apiKey?: string;

}
export interface Message {
    role: string;
    content: string;
}