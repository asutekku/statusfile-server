import {Keys} from "./StatusReader";


const types: Map<Keys, string> = new Map([])

export class StatusPackage {
    private _dependencies: Dependency[] = [];
    private _requiredBy: Dependency[] = [];

    /**
     * This is used for dynamically computed properties.
     */
    [index: string]: any;

    constructor(values: Record<string, string>) {
        Object.keys(values).forEach((v: string) => {
            this[v] = values[v];
        });
    }

    get requiredBy(): Dependency[] {
        return this._requiredBy;
    }

    set requiredBy(value: Dependency[]) {
        this._requiredBy = value;
    }

    set dependencies(deps: Dependency[]) {
        this._dependencies = deps;
    }

    get dependencies(): Dependency[] {
        return this._dependencies;
    }

    dependenciesFromSArray = (deps: string[]) => {
        if (deps) {

            /**
             * Checks if the dependency has an alternative available
             * If yes, create two dependencies and mark the second one as alternative
             */
            let depends: any[] = deps.map((d: string) => {
                let splitDep: string[] = d.split("|");
                if (splitDep.length == 2) {
                    return [new Dependency(splitDep[0], false), new Dependency(splitDep[1], true)]
                }
                return new Dependency(splitDep[0], false);
            });

            //Flattens the array
            let flattened: Dependency[] = [].concat.apply([], depends);

            // Removes any unnecessary data from the dependency name
            flattened = flattened ? flattened.map((d: any) => {
                d.name = d.name.replace(/\s/g, '').replace(/\((.*)\)/, '').replace(":any", "");
                return d;
            }) : [];

            // Returns only unique dependencies
            if (flattened.length !== 0) {
                flattened = this.removeDuplicatesBy((x: Dependency) => x.name, flattened);
            }
            this._dependencies = flattened;
        }
    };


    /**
     * Uses set to test whether the item iterated through is unique or not
     * @param keyFn
     * @param array
     */
    removeDuplicatesBy = (keyFn: any, array: any[]) => {
        let set = new Set();
        return array.filter(function (x) {
            const key = keyFn(x), isNew = !set.has(key);
            if (isNew) set.add(key);
            return isNew;
        });
    };

    /**
     * Checks whether the dependency is installed or not
     * Used when creating links in the webapp
     * @param installed
     */
    checkInstalledDependencies(installed: StatusPackage[]): void {
        this._dependencies = this._dependencies ? this._dependencies.map((dep: Dependency) => {
            dep.installed = installed.find((i: StatusPackage) => (i.package == dep.name)) !== undefined;
            return dep;
        }) : [];
        this._requiredBy = this._requiredBy ? this._requiredBy.map((dep: Dependency) => {
            dep.installed = installed.find((i: StatusPackage) => (i.package == dep.name)) !== undefined;
            return dep;
        }) : [];
    }
}

/**
 * Class used to store the dependency data.
 */
export class Dependency {
    get alternative(): boolean {
        return this._alternative;
    }

    set alternative(value: boolean) {
        this._alternative = value;
    }

    get installed(): boolean {
        return this._installed;
    }

    set installed(value: boolean) {
        this._installed = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    private _name: string;
    private _installed: boolean;
    private _alternative: boolean;

    constructor(name: string, alternative?: boolean) {
        this._name = name;
        this._alternative = alternative ? alternative : false;
        this._installed = false;
    }
}