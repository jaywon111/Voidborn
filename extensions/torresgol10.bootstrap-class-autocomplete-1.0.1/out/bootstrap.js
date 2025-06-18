"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCacheClasses = exports.setBootstrapVersion = exports.getBootstrapVersion = exports.getBootstrapClasses = void 0;
const os = require("os");
const fs = require("fs");
const path = require("path");
const node_fetch_1 = require("node-fetch");
const vscode = require("vscode");
const extension_1 = require("./extension");
let url = "https://cdn.jsdelivr.net/npm/bootstrap@latest/dist/css/bootstrap.css";
async function getBootstrapClasses() {
    const classesCache = getCacheClasses();
    if (classesCache.length === 0) {
        // Primero buscamos el archivo CSS en el proyecto
        const rootPath = vscode.workspace.workspaceFolders;
        if (rootPath !== undefined) {
            const bootstrapPath = path.join(rootPath[0].uri.fsPath, 'node_modules', 'bootstrap', 'dist', 'css', 'bootstrap.css');
            if (fs.existsSync(bootstrapPath)) {
                const packageJson = JSON.parse(fs.readFileSync(path.join(rootPath[0].uri.fsPath, 'node_modules', 'bootstrap', 'package.json'), 'utf8'));
                if (packageJson.config.version_short) {
                    setBootstrapVersion(packageJson.config.version_short);
                    extension_1.statusBarItem.text = packageJson.config.version_short;
                }
                else {
                    setBootstrapVersion(packageJson.version);
                    extension_1.statusBarItem.text = packageJson.version;
                }
                // Si el archivo existe, leemos el contenido y extraemos las clases
                const css = fs.readFileSync(bootstrapPath, 'utf8');
                return extractClassesFromCss(css);
            }
        }
        // Si no hemos encontrado el archivo en el proyecto, descargamos el archivo desde Internet
        const version = getBootstrapVersion();
        if (version !== 'latest') {
            url = url.replace('latest', version);
        }
        const response = await (0, node_fetch_1.default)(url);
        const responseText = await response.text();
        const classes = extractClassesFromCss(responseText);
        writeCacheClasses(classes);
        return classes;
    }
    return classesCache;
}
exports.getBootstrapClasses = getBootstrapClasses;
function extractClassesFromCss(css) {
    const classRegex = /\.(?!\d)([\w-]+)/g;
    const classes = new Set();
    let match;
    while ((match = classRegex.exec(css))) {
        classes.add(match[1]);
    }
    return Array.from(classes);
}
function getBootstrapVersion() {
    const config = vscode.workspace.getConfiguration('bootstrapAutocomplete');
    return config.get('version') || '5.3.2';
}
exports.getBootstrapVersion = getBootstrapVersion;
function setBootstrapVersion(version) {
    const config = vscode.workspace.getConfiguration('bootstrapAutocomplete');
    config.update("version", version, true);
}
exports.setBootstrapVersion = setBootstrapVersion;
function writeCacheClasses(classes) {
    const cachePath = getCachePath();
    fs.writeFileSync(cachePath, JSON.stringify(classes));
}
function getCacheClasses() {
    const cachePath = getCachePath();
    if (fs.existsSync(cachePath)) {
        return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    }
    return [];
}
function removeCacheClasses() {
    const cachePathDir = getCacheDir();
    fs.readdir(cachePathDir, (err, files) => {
        if (err) {
            throw err;
        }
        for (const file of files) {
            fs.unlinkSync(cachePathDir + file);
        }
    });
}
exports.removeCacheClasses = removeCacheClasses;
function getCachePath() {
    const cacheDir = getCacheDir();
    const version = getBootstrapVersion();
    return path.join(cacheDir, `bootstrap-classes-${version}.json`);
}
function getCacheDir() {
    let cachePath;
    if (process.platform === 'win32') {
        cachePath = path.join(os.homedir(), 'AppData', 'Local', 'bootstrap-class-autocomplete', 'cache');
    }
    else if (process.platform === 'darwin') {
        cachePath = path.join(os.homedir(), 'Library', 'Caches', 'bootstrap-class-autocomplete');
    }
    else {
        cachePath = path.join(os.homedir(), '.cache', 'bootstrap-class-autocomplete');
    }
    try {
        fs.mkdirSync(cachePath, { recursive: true });
    }
    catch (err) {
        if (err.code !== 'EEXIST') {
            console.error(`Failed to create cache directory: ${err.message}`);
        }
    }
    return cachePath;
}
//# sourceMappingURL=bootstrap.js.map