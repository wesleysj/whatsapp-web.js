const path = require('path');
const fs = require('fs');

const { WebCache, VersionResolveError } = require('./WebCache');

/**
 * LocalWebCache - Fetches a WhatsApp Web version from a local file store
 * @param {object} options - options
 * @param {string} options.path - Path to the directory where cached versions are saved, default is: "./.wwebjs_cache/" 
 * @param {boolean} options.strict - If true, will throw an error if the requested version can't be fetched. If false, will resolve to the latest version.
 */
class LocalWebCache extends WebCache {
    constructor(options = {}) {
        super();

        this.path = options.path || './.wwebjs_cache/';
        this.strict = options.strict || false;
    }

    _sanitizeVersion(version) {
        return String(version).replace(/[^0-9.]/g, '');
    }

    _validateVersion(version) {
        if(/[\\/]/.test(version)) {
            throw new Error('Invalid version, path separators are not allowed.');
        }
    }

    async resolve(version) {
        this._validateVersion(version);
        const sanitized = this._sanitizeVersion(version);
        const filePath = path.join(this.path, `${sanitized}.html`);
        
        try {
            return fs.readFileSync(filePath, 'utf-8');
        }
        catch (err) {
            if (this.strict) throw new VersionResolveError(`Couldn't load version ${version} from the cache`);
            return null;
        }
    }

    async persist(indexHtml, version) {
        this._validateVersion(version);
        const sanitized = this._sanitizeVersion(version);
        const filePath = path.join(this.path, `${sanitized}.html`);
        fs.mkdirSync(this.path, { recursive: true });
        fs.writeFileSync(filePath, indexHtml);
    }
}

module.exports = LocalWebCache;
