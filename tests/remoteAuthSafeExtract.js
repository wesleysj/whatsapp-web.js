const path = require('path');
const { expect } = require('chai');
const sinon = require('sinon');

process.env.NODE_PATH = path.join(__dirname, 'stubs');
require('module').Module._initPaths();

const RemoteAuth = require('../src/authStrategies/RemoteAuth');

describe('RemoteAuth safe extraction', function() {
    let unzipper;
    let ra;

    beforeEach(function() {
        unzipper = require('unzipper');
    });

    afterEach(function() {
        sinon.restore();
        delete require.cache[require.resolve('unzipper')];
    });

    function createRA() {
        return new RemoteAuth({ store: {}, backupSyncIntervalMs: 60000 });
    }

    it('rejects entries with path traversal', async function() {
        sinon.stub(unzipper.Open, 'file').resolves({
            files: [{ path: '../evil.txt' }],
            extract: sinon.stub().resolves(),
        });
        ra = createRA();
        ra.userDataDir = path.resolve('data');
        await expect(ra.unCompressSession('zip')).to.be.rejectedWith(Error);
    });

    it('rejects entries with absolute paths', async function() {
        sinon.stub(unzipper.Open, 'file').resolves({
            files: [{ path: '/evil.txt' }],
            extract: sinon.stub().resolves(),
        });
        ra = createRA();
        ra.userDataDir = path.resolve('data');
        await expect(ra.unCompressSession('zip')).to.be.rejectedWith(Error);
    });

    it('allows safe entries', async function() {
        const extractStub = sinon.stub().resolves();
        sinon.stub(unzipper.Open, 'file').resolves({
            files: [{ path: 'good/file.txt' }],
            extract: extractStub,
        });
        ra = createRA();
        ra.userDataDir = path.resolve('data');
        await expect(ra.unCompressSession('zip')).to.be.fulfilled;
        expect(extractStub.calledOnce).to.equal(true);
    });
});
