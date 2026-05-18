# Kryptokrona Facuet

<p>
<a href="https://chat.kryptokrona.se">
    <img src="https://img.shields.io/discord/562673808582901793?label=Discord&logo=Discord&logoColor=white&style=flat">
</a> 
<a href="https://github.com/swepool/hugin-faucet/issues">
    <img src="https://img.shields.io/github/issues/kryptokrona/kryptokrona-faucet">
</a>
<a href="https://github.com/kryptokrona/hugin-cache/pulls">
    <img src="https://img.shields.io/github/issues-pr/kryptokrona/kryptokrona-faucet">
</a>
<a href="https://github.com/kryptokrona/hugin-cache/commits/main">
    <img src="https://img.shields.io/github/commit-activity/m/kryptokrona/kryptokrona-faucet">
</a>
<a href="https://github.com/kryptokrona/hugin-cache/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/kryptokrona/kryptokrona-faucet">
</a>
<a href="https://twitter.com/kryptokrona">
    <img src="https://img.shields.io/twitter/follow/kryptokrona">
</a>
</p>

## A simple faucet used for Hugin Messenger

## Node failover

By default the faucet connects to a local Kryptokrona daemon at `localhost:11898`.
Set `NODE_HOST`, `NODE_PORT`, and optionally `NODE_SSL` to change the primary
node.

Set `BACKUP_NODES` to a comma-separated list of fallback nodes. The faucet checks
the primary node first, then picks from the backup list in random order until it
finds a reachable daemon.

```bash
NODE_HOST=localhost
NODE_PORT=11898
BACKUP_NODES=node-1.example.com:11898,https://node-2.example.com
```

# Technologies

- Node
- Express
- fs
- kryptokrona-wallet-backend-js
- kryptokrona-crypto

## Donate

### Bitcoin (BTC)
bc1ql97dlhhexma7agkk7gmg76t7ljycuqc9xgr4vl


### Monero (XMR)
49AWzFTrZZvDKNzCUHPSXm5ZUyBrFan7xXXrKmfS6ircfcTAeiXBH1Yg99V4jiiEdT8RYhXvEiAgbMjEzq8AJJCbAd5ckJG


### Kryptokrona (XKR)
SEKReXXU9aJPiwjX2XkpbK8ACMWbUNXcYPxUVSiUYpNdhj8Z2snEy8CjjorZUNyswQNfzAmVWuGksU72Sf3Kq79Zd3fJWHq4Nyx


# Help and Support

For questions and support please use the channel #support in Kryptokrona Discord server. The issue tracker is for bug reports and feature discussions only.

# Contributors

The following contributors have either helped to start this project, have contributed
code, are actively maintaining it (including documentation), or in other ways
being awesome contributors to this project. **We'd like to take a moment to recognize them.**

[<img src="https://github.com/Swepool.png?size=72" alt="mjovanc" width="72">](https://github.com/Swepool)

# License

The license is GPL-3.0 License.
