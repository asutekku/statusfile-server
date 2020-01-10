import {Controller} from "./Controller";
import * as url from "url";
import {IncomingMessage, ServerResponse} from "http";

export class DependencyController implements Controller {
    path: string;
    listener: any;
    type: string = "request";

    constructor() {
        this.path = '/dependency/';
        this.listener = (req: IncomingMessage, res: ServerResponse) => {
            try {
                res.writeHead(200, {'Content-Type': 'text/json'});
                const q: any = url.parse(<string>req.url, true).query;
                const txt: string = `{${q.year} :${q.month}}`;
                res.end(txt);
            } catch (e) {
                console.log(e);
            }
        }
    }
}