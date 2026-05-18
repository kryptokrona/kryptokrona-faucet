const assert = require('assert')
const {formatNode, getConfiguredNodes, parseNode, parseNodeList} = require('../nodeConfig')

assert.deepStrictEqual(parseNode('backup.example:11898'), {
    host: 'backup.example',
    port: 11898,
    ssl: undefined,
})

assert.deepStrictEqual(parseNode('https://backup.example'), {
    host: 'backup.example',
    port: 443,
    ssl: true,
})

assert.strictEqual(parseNodeList('one.example:11898,https://two.example').length, 2)
assert.strictEqual(formatNode({host: 'node.example', port: 11898, ssl: undefined}), 'node.example:11898')
assert.strictEqual(formatNode({host: 'node.example', port: 11898, ssl: false}), 'node.example:11898 (http)')

const nodes = getConfiguredNodes({
    NODE_HOST: 'primary.example',
    NODE_PORT: '1111',
    NODE_SSL: 'false',
    BACKUP_NODES: 'backup.example:2222',
})

assert.strictEqual(nodes[0].host, 'primary.example')
assert.strictEqual(nodes[0].port, 1111)
assert.strictEqual(nodes[0].ssl, false)
assert.strictEqual(nodes.length, 2)

console.log('nodeConfig checks passed')
