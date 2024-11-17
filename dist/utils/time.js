"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Time {
    static getCurrentTime() {
        let timezone = "GMT+" + new Date().getTimezoneOffset() / 60;
        return Utilities.formatDate(new Date(), timezone, "yyyy-MM-dd HH:mm:ss");
    }
}
exports.default = Time;
