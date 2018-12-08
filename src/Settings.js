const value = Object.seal({
    /** @type {IPAddress[]} */
    listenerForbiddenIPs: [],
    /** @type {string[]} */
    listenerAcceptedOrigins: [],
    listenerMaxConnections: 100,
    listenerMaxClientDormancy: 1000 * 60,
    listenerMaxConnectionsPerIP: -1,
    listenerMinLegacyProtocol: 1,
    listenerMaxLegacyProtocol: 18,
    listeningPort: 3000,

    serverUpdateFrequency: 25,
    serverName: "ReroAgar FFA Server",
    serverGamemode: "FFA",
    serverChatEnabled: true,

    worldMapX: 0,
    worldMapY: 0,
    worldMapW: 7071,
    worldMapH: 7071,
    worldFinderMaxLevel: 16,
    worldFinderMaxItems: 16,
    worldSafeSpawnTries: 16,
    worldSafeSpawnFromEjectedChance: 0.8,
    worldPlayerDisposeDelay: 25 * 60,

    worldPlayerBotsPerWorld: 10,
    worldMinionsPerPlayer: 0,
    worldMaxPlayers: 50,
    worldMaxCount: 2,
    matchmakerNeedsQueuing: false,
    matchmakerBulkSize: 1,

    minionName: "Minion",
    minionSpawnSize: 32,
    minionEnableERTPControls: false,
    minionEnableQBasedControl: true,

    pelletMinSize: 10,
    pelletMaxSize: 32,
    pelletGrowTicks: 1,
    pelletCount: 1000,

    virusMinCount: 30,
    virusMaxCount: 90,
    virusSize: 100,
    virusFeedTimes: 7,
    virusPushing: false,
    virusSplitBoost: 780,
    virusPushBoost: 120,
    virusMonotonePops: true,

    ejectedSize: 48,
    ejectingLoss: 43,
    ejectDispersion: 0.3,
    ejectedCellBoost: 780,

    mothercellSize: 149,
    mothercellCount: 0,
    mothercellPassiveSpawnChance: 0.05,
    mothercellActiveSpawnSpeed: 1,
    mothercellPelletBoost: 90,
    mothercellMaxPellets: 96,
    mothercellMaxSize: 65535,
    
    playerRoamSpeed: 32,
    playerRoamViewScale: 0.4,
    playerViewScaleMult: 1,
    playerMinViewScale: 0.01,
    playerMaxNameLength: 16,
    
    playerMinSize: 32,
    playerSpawnSize: 100,
    playerMaxSize: 1500,
    playerMinSplitSize: 60,
    playerMinEjectSize: 60,
    playerMaxCells: 64,

    playerMoveMult: 1,
    playerSplitBoost: 780,
    playerNoCollideDelay: 13,
    playerNoMergeDelay: 15,
    /** @type {"old" | "new"} */
    playerMergeVersion: "old",
    playerMergeTime: 0.1,
    playerMergeTimeIncrease: 0.02,
    playerDecayMult: 0.001
});

module.exports = value;
