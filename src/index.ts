import * as http from "http";
import {Server} from "net";
import {Controller} from "./Controllers/Controller";
import {IncomingMessage, ServerResponse} from "http";
import {Omi, OmiTemplate} from "./Omi";

export class ReaktorServer {
    app: Server;
    private readonly port: number;
    private readonly templateFunction: (values: { [key: string]: string; }) => string;

    constructor(controllers?: Controller[]) {
        this.port = 8080;
        this.templateFunction = Omi.compile("src/templates/main.omi");
        let msg: string = this.templateFunction(
            {
                packageDescription: "This is the package description",
                packageName: "This is the package name"
            }
        );
        console.log(msg);
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