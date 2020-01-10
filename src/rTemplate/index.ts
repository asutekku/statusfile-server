import * as fs from "fs";
import {rElement} from "./rElements";

export class rTemplate {
    private structure!: rElement;

    constructor(filepath: string) {
        let content: string = "";
        try {
            content = fs.readFileSync(filepath, 'utf8');
        } catch (e) {
            console.log(`ERROR: Template file not found, ${filepath}`)
        }
        if (content.length > 0) {
            let lines = content.match(/[^\r\n]+/g)!;
            this.structure = this.parse(lines);
        }
    }


    /**
     * Creates an object of the template file
     * @param content The document to be parsed
     */
    parse(content: string[]): rElement {
        let nodes: rElement[] = content.map((line: string) => new rElement(line));
        let root: rElement = nodes.shift()!;
        root.addChildren(nodes);
        return root;
    };

    public toHTML(): string {
        return this.structure.toHTML();
    }

}

/**
 * Handy little class to log the steps of the algorithm
 */
export class Logger {
    private _loggingEnabled: boolean = true;
    private _stepNumber: number = 0;
    private readonly _processName: string;

    constructor(name: string) {
        this._processName = name;
        this._stepNumber = 0;
    }

    get name() {
        return this._processName;
    }

    /**
     * Setup logging parameters
     * @param enabled Is logging enabled or not
     */
    public setupLogging(enabled: boolean) {
        this._loggingEnabled = enabled;
    }

    /**
     * Simple logger that logs the step
     * @param msg The message to be logged
     * @constructor
     */
    public Log(msg: string) {
        this._stepNumber++;
        if (this._loggingEnabled) console.log(`${this._stepNumber}. ${msg}`)
    }

    /**
     * SubLog can be used when you want to log additional information, but do not want to assign a full step for it.
     * The SubLog has slight indentation to differentiate it from normal logs.
     * @param msg The message to be logged
     */
    public subLog(msg: string) {
        if (this._loggingEnabled) console.log(`   ${msg}`)
    }
}