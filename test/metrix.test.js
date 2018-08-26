const assert = require('power-assert');
const path = require('path');
const pify = require('pify');
const { MetrxLogger, startAgent } = require('../');
const fs = require('../lib/utils/fs');

describe('Metrix', function() {
    let agentK;
    let metrix;
    const options = {
        name: 'appName',
        reporter: ['filesystem'],
        tasks: [],
        rundir: path.join(__dirname, 'fixtures/run'),
        files: {
            'built-in': path.join(__dirname, 'fixtures/agentk/built-in.log'),
            application: path.join(__dirname, 'fixtures/agentk/application.log'),
            error: path.join(__dirname, 'fixtures/common-error.log')
        }
    }

    before(async function() {
        await fs.del(path.join(__dirname, 'fixtures/run'))
        agentK = await pify(startAgent)(options);
        metrix = new MetrxLogger(options);
        await metrix.ready();
    })

    it('should metrix', async function() {
        metrix.getMetrix(['a']).counter('b').inc();
    });

    it('should collect', async function() {
        const rs = await agentK.collect();
        assert(rs.length > 0);
    });

    it('should report', async function() {
        const rs = await agentK.report();
        assert(rs.filesystem.data.process.length > 0);
    });

    after(function() {
        agentK.kill()
    })
});