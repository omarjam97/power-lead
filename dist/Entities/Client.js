"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Client {
    constructor(info) {
        this.info = info;
    }
    serialize() {
        return JSON.stringify(this.info);
    }
    static unserialize(data) {
        return new Client(JSON.parse(data));
    }
}
exports.default = Client;
