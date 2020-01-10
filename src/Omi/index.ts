import * as fs from "fs";
import {OmiElement} from "./rElements";

export class OmiTemplate {
    private structure!: OmiElement;

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
    parse(content: string[]): OmiElement {
        let nodes: OmiElement[] = content.map((line: string) => new OmiElement(line));
        let root: OmiElement = nodes.shift()!;
        root.addChildren(nodes);
        return root;
    };

    public toHTML(): string {
        return this.structure.toHTML();
    }

}

export class Omi {
    public static compile(filepath: string): (values?: { [key: string]: string; }) => string {
        let template: OmiTemplate = new OmiTemplate(filepath);
        return (values?: { [key: string]: string; }) => {
            let temp = template.toHTML();
            if (values) {
                Object.keys(values).forEach(function (key: string) {
                    temp = temp.replace(`%${key}%`, values[key]);
                });
            }
            return temp;
        };
    }

    public static getTemplate(filepath: string): OmiTemplate {
        return new OmiTemplate(filepath);
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