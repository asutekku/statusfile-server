import {Dependency, StatusPackage} from "./package";


/**
 * The class handling the processing of the file and creating  the collection of packages
 */
export class StatusReader {

    /**
     * This processes the file and produces an array of StatusPackage s
     * @param file
     */
    static processFile(file: string): StatusPackage[] {
        // Splits the packages
        let statusData: string[] = file.split("\r\n\r\n");

        let map = statusData.map((pkg: string) => {
            if (pkg.length < 1) return; // Checks that no invalid packages are handled
            let name = StatusReader.getValue(pkg, "Package: ")!;
            let statusPkg = new StatusPackage(name);
            statusPkg.status = StatusReader.getValue(pkg, "Status: ")!;
            statusPkg.description = this.getDescription(pkg);
            statusPkg.descriptionHeader = StatusReader.getValue(pkg, "Description: ");
            statusPkg.priority = StatusReader.getValue(pkg, "Priority: ")!;
            statusPkg.section = StatusReader.getValue(pkg, "Section: ")!;
            statusPkg.installSize = StatusReader.getValue(pkg, "Installed-Size: ")!;
            statusPkg.maintainer = StatusReader.getValue(pkg, "Maintainer: ")!;
            statusPkg.architecture = StatusReader.getValue(pkg, "Architecture: ")!;
            statusPkg.source = StatusReader.getValue(pkg, "Source: ")!;
            statusPkg.version = StatusReader.getValue(pkg, "Version: ")!;
            statusPkg.replaces = StatusReader.getValue(pkg, "Replaces: ")!;
            statusPkg.breaks = StatusReader.getValue(pkg, "Breaks: ")!;
            statusPkg.enhances = StatusReader.getValue(pkg, "Enhances: ")!;
            statusPkg.originalMaintainer = StatusReader.getValue(pkg, "Original-Maintainer: ");
            let dep = StatusReader.getValue(pkg, "Depends: ");
            statusPkg.dependenciesFromSArray(dep ? dep.split(", ") : undefined);
            return statusPkg;
        }).filter(v => v && v.name);
        /**
         * Gets the reverse dependencies. This is best done afterwards for the clarity of the code.
         */
        map = map.map((pkg: StatusPackage) => {
            let newMap = pkg;
            let reverseDeps: any = map.filter((pkgInner: StatusPackage) => {
                return pkgInner.dependencies && pkgInner.dependencies.find(d => d.name == pkg.name);
            });
            reverseDeps = reverseDeps.length != 0 ? reverseDeps.map((p: any) => new Dependency(p.name)) : [];
            reverseDeps.sort();
            newMap.requiredBy = reverseDeps;
            return newMap
        });
        map = map.sort((a, b) => a.name.localeCompare(b.name));
        map = map.map((p: StatusPackage) => {
            p.checkInstalledDependencies(map);
            return p;
        });
        return map;
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
        let regExString = new RegExp(StatusReader.escapeRegExp(key) + "(.*?)\r", "g");
        let RE = regExString.exec(line);
        return (RE) ? RE[1] : undefined;
    }
}


//StatusReader.readFile();