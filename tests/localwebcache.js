const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const fs = require('fs');
const path = require('path');
const LocalWebCache = require('../src/webCache/LocalWebCache');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('LocalWebCache path handling', function() {
    let cacheDir;
    let cache;

    beforeEach(function() {
        cacheDir = fs.mkdtempSync(path.join(__dirname, 'cache-'));
        cache = new LocalWebCache({ path: cacheDir });
    });

    afterEach(function() {
        fs.rmSync(cacheDir, { recursive: true, force: true });
    });

    it('sanitizes version to digits and dots', async function() {
        await cache.persist('html', 'v1.x.2');
        const expected = path.join(cacheDir, '1.2.html');
        expect(fs.existsSync(expected)).to.equal(true);
    });

    it('rejects path separators on persist', async function() {
        await expect(cache.persist('html', '../evil')).to.be.rejectedWith(Error);
    });

    it('rejects path separators on resolve', async function() {
        await expect(cache.resolve('../evil')).to.be.rejectedWith(Error);
    });
});
