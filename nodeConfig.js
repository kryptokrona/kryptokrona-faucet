const DEFAULT_NODE_PORT = 11898

const parseBoolean = value => {
    if (value === undefined || value === '') return undefined
    return ['1', 'true', 'yes'].includes(value.toString().toLowerCase())
}

const parseNode = value => {
    const raw = value.toString().trim()
    if (!raw) return undefined

    const hasProtocol = /^https?:\/\//i.test(raw)
    const url = new URL(hasProtocol ? raw : `http://${raw}`)
    const ssl = hasProtocol ? url.protocol === 'https:' : undefined
    const port = Number(url.port || (hasProtocol ? (ssl ? 443 : 80) : DEFAULT_NODE_PORT))

    if (!url.hostname || Number.isNaN(port)) {
        throw new Error(`Invalid daemon node: ${value}`)
    }

    return {
        host: url.hostname,
        port,
        ssl,
    }
}

const parseNodeList = value => {
    if (!value) return []

    return value
        .split(',')
        .map(parseNode)
        .filter(Boolean)
}

const shuffleNodes = nodes => {
    const shuffled = [...nodes]

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    return shuffled
}

const getConfiguredNodes = env => {
    const primary = {
        host: env.NODE_HOST || 'localhost',
        port: Number(env.NODE_PORT || DEFAULT_NODE_PORT),
        ssl: parseBoolean(env.NODE_SSL),
    }

    if (Number.isNaN(primary.port)) {
        throw new Error(`Invalid NODE_PORT: ${env.NODE_PORT}`)
    }

    return [
        primary,
        ...shuffleNodes(parseNodeList(env.BACKUP_NODES || '')),
    ]
}

const formatNode = node => `${node.host}:${node.port}${node.ssl === undefined ? '' : ` (${node.ssl ? 'https' : 'http'})`}`

module.exports = {
    DEFAULT_NODE_PORT,
    formatNode,
    getConfiguredNodes,
    parseNode,
    parseNodeList,
}
