import * as http from "http";
import {Server} from "net";
import {Controller} from "./Controllers/Controller";
import {IncomingMessage, ServerResponse} from "http";
import {rTemplate} from "./rTemplate";

export class ReaktorServer {
    app: Server;
    private port: number;
    private template: rTemplate;

    constructor(controllers?: Controller[]) {
        this.port = 8080;
        this.template = new rTemplate("src/templates/main.rt");
        let msg = this.template.toHTML();
        this.app = http.createServer((req: IncomingMessage, res: ServerResponse) => {
            res.writeHead(200, {'Content-Type': 'text/html'});
            console.log(`Request received from: ${req.url}`);
            res.write(msg);
            res.end();
        });
        if (controllers) this.initializeControllers(controllers);
    }

    public listen(): void {
        this.app.listen(this.port, () => {
            console.log(`App listening on the port ${this.port}`);
        });
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.addListener(controller.type, controller.listener)
        });
    }
}