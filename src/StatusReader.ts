import {Dependency, StatusPackage} from "./package";

/**
 * Enumerator including the fields included in the status file
 * This is handled as an object in Javascript
 */
export enum Keys {
    package = "Package",
    description = "Description",
    section = "Section",
    maintainer = "Maintainer",
    architecture = "Architecture",
    source = "Source",
    version = "Version",
    depends = "Depends"
}

/**
 * The class handling the processing of the file and creating  the collection of packages
 */
export class StatusReader {

    /**
     * Parses the string given with values and returns an object containing findings
     * @param stringArr String to be parsed
     * @param keys The keys that the function iterates over
     * @param callback The function to parse the text with. Must have two parameters, text to be parsed and string to find
     */
    static getValues(stringArr: string, keys: Record<string, string>, callback: (arr: string, key: string) => string | undefined): Record<string, string> {

        // Define the values to be an object of any king, as long as it has only string values in values
        let values: Record<string, string> = {};

        // Don't check keys directly as some of the values might be missing
        Object.keys(keys).forEach((k: string) => {

            // Use the getValue function to return the value of the queried value
            // We can use custom functions to parse the text.
            let value: string | undefined = callback(stringArr, `${keys[k]}`);

            // Assign the value only if it is defined
            if (value !== undefined) values[k] = value;
        });
        //console.log(values);
        return values;
    }

    /**
     * This processes the file and produces an array of StatusPackage s
     * @param file
     */
    public static processFile(file: string): StatusPackage[] {

        // Splits the list of packages
        const statusData: string[] = file.split("\r\n\r\n");

        let packages: StatusPackage[] = statusData.map((pkg: string) => {

            // Return an object of values to be iterated through
            let values: Record<string, string> = StatusReader.getValues(pkg, Keys, StatusReader.getValue);

            let statusPkg = new StatusPackage(values);

            // Get the description in two parts. First one is the "title" of the package, second one is the complete description
            statusPkg.descriptionHeader = values.description ? values.description : "";
            statusPkg.description = this.getDescription(pkg);

            let dep = StatusReader.getValue(pkg, "Depends");
            statusPkg.dependenciesFromSArray(values.depends ? values.depends.split(", ") : []);
            return statusPkg;
        }).filter(v => v && v.package);


        /**
         * Gets the reverse dependencies. This is best done afterwards for the clarity of the code.
         */
        packages = packages.map((pkg: StatusPackage) => {

            // Return packages that depend on current package
            let dependencyPackages: Dependency[] = packages.filter((pkgInner: StatusPackage) => {
                return pkgInner.dependencies && pkgInner.dependencies.find((d: Dependency) => d.name == pkg.package);
            }).map((p: any) => new Dependency(p.package));
            //console.log(dependencyPackages);
            //let reverseDeps: Dependency[] = dependencyPackages.length != 0 ? dependencyPackages.map((p: any) => new Dependency(p.package)) : [];
            dependencyPackages.sort();
            pkg.requiredBy = dependencyPackages;
            return pkg;
        });

        // Sort packages alphabetically
        packages = packages.sort((a, b) => a.package.localeCompare(b.package));

        // Check which Dependencies are installed for the user
        packages = packages.map((p: StatusPackage) => {
            p.checkInstalledDependencies(packages);
            return p;
        });

        return packages;
    }

    private static getDescription(str: string): string[] {
        return str.split('\n').filter((r: string) => r.startsWith(' ') && !r.startsWith(' /etc'));
    }

    /**
     * Returns an array of strings according to
     * @param str
     */
    public static StringifyPackage(str: string): string {
        let strings: string[] = str.split("\n",);
        let previousLine: string = strings[0];
        let length: number = strings.length;

        // Starts from 1 as we have already defined the first row
        for (let i = 1; i < length; i++) {
            if (previousLine[0] == " ") {
                previousLine.concat(strings[i]);
                strings.splice(i, 1);
                length--;
            }
            previousLine = strings[0];
        }
        return strings.join('\n');
    }

    /**
     * We need this to escape the strings as some package names contain forbidden characters
     * @param str
     */
    private static escapeRegExp(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Returns a value between the identifier and newline
     * @param key The value you want to get
     * @param line The line being checked
     */
    private static getValue(line: string, key: string): string | undefined {
        let regExString = new RegExp(StatusReader.escapeRegExp(key) + ": (.*?)\r", "g");
        let RE = regExString.exec(line);
        return (RE) ? RE[1] : undefined;
    }
}


//StatusReader.readFile();