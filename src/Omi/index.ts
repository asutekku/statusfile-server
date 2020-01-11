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
