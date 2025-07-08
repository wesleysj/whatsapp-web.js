const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const fetch = require('node-fetch');

const MessageMedia = require('../../src/structures/MessageMedia');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('MessageMedia.fromUrl validation', function() {
    afterEach(function() {
        sinon.restore();
    });

    it('rejects non HTTPS URLs by default', async function() {
        await expect(MessageMedia.fromUrl('http://example.com/file.png'))
            .to.be.rejectedWith('Unsupported URL protocol');
    });

    it('rejects disallowed hosts', async function() {
        await expect(MessageMedia.fromUrl('https://evil.com/file.png', {allowedHosts: ['good.com']}))
            .to.be.rejectedWith('URL host not allowed');
    });

    it('rejects denied hosts', async function() {
        await expect(MessageMedia.fromUrl('https://evil.com/file.png', {deniedHosts: ['evil.com']}))
            .to.be.rejectedWith('URL host denied');
    });

    it('uses custom validator', async function() {
        const validator = sinon.stub().returns(false);
        await expect(MessageMedia.fromUrl('https://example.com/file.png', {validateUrl: validator}))
            .to.be.rejectedWith('URL validation failed');
        expect(validator.calledOnce).to.be.true;
    });

    it('downloads when validation passes', async function() {
        const response = {
            headers: { get: (h) => ({ 'Content-Type': 'image/png', 'Content-Length': '4' }[h]) },
            buffer: async () => Buffer.from('test')
        };
        sinon.stub(fetch, 'default').resolves(response);
        const media = await MessageMedia.fromUrl('https://example.com/file.png', {allowedHosts: ['example.com']});
        expect(media).to.be.instanceOf(MessageMedia);
        expect(media.mimetype).to.equal('image/png');
        expect(media.data).to.equal(Buffer.from('test').toString('base64'));
    });
});
