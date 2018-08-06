const PlayingRouter = require("../primitives/PlayingRouter");
const Reader = require("../primitives/Reader");

class Connection extends PlayingRouter {
    /**
     * @param {Listener} listener
     * @param {WebSocket} webSocket
     */
    constructor(listener, webSocket) {
        super(listener);
        this.remoteAddress = webSocket._socket.remoteAddress;
        this.webSocket = webSocket;
        this.lastActivityTime = Date.now();
        
        this.upgradeLevel = 0;
        /** @type {Protocol} */
        this.protocol = null;

        this.socketDisconnected = false;
        this.closeCode = NaN;
        /** @type {string} */
        this.closeReason = null;

        /** @type {Minion[]} */
        this.minions = [];
        this.minionsFrozen = false;
        this.controllingMinions = false;

        webSocket.on("close", this.onSocketClose.bind(this));
        webSocket.on("message", this.onSocketMessage.bind(this));
        webSocket.on("ping", this.closeSocket.bind(webSocket, 1003, "Unexpected message format"));
        webSocket.on("pong", this.closeSocket.bind(webSocket, 1003, "Unexpected message format"));
    }

    close() {
        if (!this.socketDisconnected) return void this.closeSocket(1001, "Manual connection close call");
        super.close();
        this.disconnected = true;
        this.disconnectionTick = this.handle.tick;
        this.listener.onDisconnection(this, this.closeCode, this.closeReason);
        this.webSocket.removeAllListeners();
    }

    static get type() { return "connection"; }
    static get isExternal() { return true; }
    static get separateInTeams() { return true; }

    /**
     * @param {number} code
     * @param {string} reason
     */
    onSocketClose(code, reason) {
        if (this.socketDisconnected) return;
        this.logger.debug(`connection from ${this.remoteAddress} has disconnected`);
        this.socketDisconnected = true;
        this.closeCode = code;
        this.closeReason = reason;
    }

    /**
     * @param {ArrayBuffer|string} data
     */
    onSocketMessage(data) {
        if (data instanceof String) return void this.closeSocket(1003, "Unexpected message format");
        if (data.byteLength > 256 || data.byteLength === 0)
            return void this.closeSocket(1009, "Unexpected message size");
        this.lastActivityTime = Date.now();
        const reader = new Reader(Buffer.from(data), 0);
        if (this.protocol !== null) this.protocol.onSocketMessage(reader);
        else {
            this.protocol = this.handle.protocols.decide(this, reader);
            if (this.protocol === null) return void this.closeSocket(1003, "Ambiguous protocol");
        }
    }
    createPlayer() {
        super.createPlayer();
        if (this.settings.matchmakerNeedsQueuing) {
            this.globalChat.directMessage(null, this, "This server requires players to be queued.");
            this.globalChat.directMessage(null, this, "Try spawning to enqueue.");
        } else this.handle.matchmaker.toggleQueued(this);
    }

    /**
     * @param {string} message
     */
    onChatMessage(message) {
        const globalChat = this.listener.globalChat;
        if (message.length >= 2 && message[0] === "/") {
            if (!this.handle.chatCommands.execute(this, message.slice(1)))
                globalChat.directMessage(null, this, "unknown command, execute /help for the list of commands");
        }
        else message && globalChat.broadcast(this, message);
    }
    onQPress() {
        if (!this.hasPlayer) return;
        if (this.listener.settings.minionEnableQBasedControl && this.minions.length > 0)
            this.controllingMinions = !this.controllingMinions;
        else this.handle.gamemode.whenPlayerPressQ(this.player);
    }
    get shouldClose() {
        return this.socketDisconnected;
    }
    update() {
        if (!this.hasPlayer) return;
        if (!this.player.hasWorld) {
            if (this.spawningName !== null)
                this.handle.matchmaker.toggleQueued(this);
            this.spawningName = null;
            this.splitAttempts = 0;
            this.ejectAttempts = 0;
            this.requestingSpectate = false;
            this.isPressingQ = false;
            this.hasProcessedQ = false;
            return;
        }
        this.player.updateVisibleCells();

        const add = [], upd = [], eat = [], del = [];
        const player = this.player;
        const     visible = player.visibleCells,
              lastVisible = player.lastVisibleCells;
        for (let id in visible) {
            const cell = visible[id];
            if (!lastVisible.hasOwnProperty(id)) add.push(cell);
            else if (cell.shouldUpdate) upd.push(cell);
        }
        for (let id in lastVisible) {
            const cell = lastVisible[id];
            if (visible.hasOwnProperty(id)) continue;
            if (cell.eatenBy !== null) eat.push(cell);
            del.push(cell);
        }
        
        if (player.state === 1 || player.state === 2)
            this.protocol.onSpectatePosition(player.viewArea);
        if (this.handle.tick % 4 === 0)
            this.handle.gamemode.sendLeaderboard(this);
        this.protocol.onVisibleCellUpdate(add, upd, eat, del);
    }
    onWorldSet() {
        this.protocol.onNewWorldBounds(this.player.world.border, true, this.protocol);
    }
    /** @param {PlayerCell} cell */
    onNewOwnedCell(cell) {
        this.protocol.onNewOwnedCell(cell);
    }

    /** @param {Buffer} data */
    send(data) {
        if (this.socketDisconnected) return;
        this.webSocket.send(data);
    }
    /**
     * @param {number=} code
     * @param {string=} reason
     */
    closeSocket(code, reason) {
        if (this.socketDisconnected) return;
        this.socketDisconnected = true;
        this.closeCode = code;
        this.closeReason = reason;
        this.webSocket.close(code || 1006, reason || "");
    }
}

module.exports = Connection;

const WebSocket = require("uws");
const Listener = require("./Listener");
const Minion = require("../bots/Minion");
const Protocol = require("../protocols/Protocol");
