import * as http from "http";
import {Server} from "net";
import {Controller} from "./Controllers/Controller";
import {IncomingMessage, ServerResponse} from "http";
import {Omi} from "./Omi";
import * as fs from "fs";

export class ReaktorServer {
    app: Server;
    private readonly port: number;
    private readonly templateFunction: (values: { [key: string]: string; }) => string;

    constructor(controllers?: Controller[]) {
        this.port = 8080;
        this.templateFunction = Omi.compile("src/templates/index.omi");
        let contentFunction = Omi.compile("src/templates/main.omi");
        let sidebarFunction = Omi.compile("src/templates/package.omi");
        let msg: string = this.templateFunction(
            {
                sideBarLeft: "This is the left sidebar",
                main: contentFunction({tableHeaders: "<th>Header</th>"}),
                sideBarRight: sidebarFunction({packageName: "Package"}),
            }
        );
        this.app = http.createServer((req: IncomingMessage, res: ServerResponse) => {
            res.writeHead(200, {'Content-Type': 'text/html'});
            console.log(`Request received from: ${req.url}`);
            if (req.url == "/css/style.css") {
                res.write(fs.readFileSync(__dirname + req.url, 'utf8'));
            }
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