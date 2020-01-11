import {Controller} from "./Controller";
import {IncomingMessage, ServerResponse} from "http";
import {StatusReader} from "../StatusReader";

export class UploadController implements Controller {
    path: string;
    listener: (req: IncomingMessage, res: ServerResponse) => void;
    type: string = "request";

    constructor(path: string) {
        this.path = path;
        this.listener = (req: IncomingMessage, res: ServerResponse) => {
            if (req.method?.toLowerCase() === 'post' && req.url == this.path) {
                req.on('error', (e: Error) => {
                    console.log(`ERROR: ${e.message}`)
                });
                let body: any = [];
                req.on('data', (chunk) => {
                    body.push(chunk);
                }).on('end', () => {
                    body = Buffer.concat(body).toString();
                    let packages = StatusReader.processFile(body);
                    //console.log(packages);
                });
            }
        }
    }
}