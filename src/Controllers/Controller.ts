import {IncomingMessage, ServerResponse} from "http";

export interface Controller {
    path: string;
    type: string;
    listener: (res: IncomingMessage, req: ServerResponse) => void;
}