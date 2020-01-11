import {ReaktorServer} from "./index";
import {DependencyController} from "./Controllers/DependencyController";
import {UploadController} from "./Controllers/UploadController";

const app = new ReaktorServer(
    [
        new DependencyController("/dependencies"),
        new UploadController("/upload")
    ]
);

app.listen();