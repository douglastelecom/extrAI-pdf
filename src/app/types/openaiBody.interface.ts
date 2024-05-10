import { ChatCompletionCreateParamsNonStreaming} from "openai/resources";

export interface FormOpenai extends ChatCompletionCreateParamsNonStreaming{
    jsonArchitecture?: string;
    instruction?: string;
    apiKey?: string;
    projectName?: string;
}
