export class OmiElement {
    private readonly params?: string[][];
    private readonly type: string = "div"; // If type is not explicitly defined, use div.
    private readonly value?: string;
    private readonly depth: number;
    private children: OmiElement[] = [];
    static globalID: number = 0;
    private id: number;

    private paramsRegEx: RegExp = /{(.*)}/;
    private typeRegEx: RegExp = /([A-Za-z0-9]*).*:|;/;
    private textRegEx: RegExp = /:.*"(.*?)"/;
    private variableRegEx: RegExp = /%(.*?)%/;
    private depthRegEx: RegExp = /^\s{0,100}/;

    constructor(str: string) {
        if (str.match(this.paramsRegEx)) {
            let eParams: string[] = str.match(this.paramsRegEx)![1].trim().split(",");
            this.params = eParams.map((ep: string) => ep.split("="))
        }
        if (str.match(this.typeRegEx)) this.type = str.trim().match(this.typeRegEx)![1].trim();
        if (str.match(this.textRegEx)) this.value = str.match(this.textRegEx)![1].trim();
        this.depth = str.match(this.depthRegEx)![0].length;

        this.id = OmiElement.globalID;
        OmiElement.globalID++;
    }

    /**
     * This function iterates through an array of OmiElements and creates a tree structure.
     * @param elements
     */
    addChildren(elements: OmiElement[]): void {
        let childLevel: number = elements[0].depth;
        while (elements.length !== 0) {
            let el: OmiElement = elements.shift()!;
            if (el.depth == childLevel) {
                this.children.push(el);
            } else if (el.depth > childLevel) {
                elements.unshift(el);
                this.children[this.children.length - 1].addChildren(elements);
            } else if (el.depth <= this.depth) {
                elements.unshift(el);
                return;
            }
        }
    }

    public toHTML(): string {
        return this.toString();
    }

    /**
     * Returns the element and all of its children as an HTML string
     */
    toString(): string {
        let children = this.children && this.children.length !== 0 ? this.children.map((c: OmiElement) => c.toString()).join("") : '',
            inner = this.value || '',
            params = this.params ? this.params.map((p: string[]) => ` ${p[0]}="${p[1].split('"').join("")}"`).join("") : '';
        return inner || children ? `<${this.type}${params}>${inner}${children}</${this.type}>` : `<${this.type}${params}/>`;
    }

}