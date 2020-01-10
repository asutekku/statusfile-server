import {ReaktorServer} from "./index";
import {DependencyController} from "./Controllers/DependencyController";

const app = new ReaktorServer(
    [
        new DependencyController()
    ]
);

app.listen();