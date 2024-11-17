"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Global_1 = require("../Global");
const time_1 = __importDefault(require("../Utils/time"));
var LogLevels;
(function (LogLevels) {
    LogLevels["CRITICAL"] = "CRITICAL";
    LogLevels["WARNING"] = "WARNING";
    LogLevels["INFO"] = "INFO";
    LogLevels["ERROR"] = "ERROR";
})(LogLevels || (LogLevels = {}));
class GLogger {
    static getSheet() {
        return Global_1.SS.getSheetByName(GLogger.sheetName);
    }
    static critical(options) {
        GLogger.log({
            logLevel: LogLevels.CRITICAL,
            Context: options.Context,
            Info: options.Info,
        });
    }
    static info(options) {
        GLogger.log({
            logLevel: LogLevels.INFO,
            Context: options.Context,
            Info: options.Info,
        });
    }
    static error(options) {
        GLogger.log({
            logLevel: LogLevels.ERROR,
            Context: options.Context,
            Info: options.Info,
        });
    }
    static warning(options) {
        GLogger.log({
            logLevel: LogLevels.WARNING,
            Context: options.Context,
            Info: options.Info,
        });
    }
    static log(options) {
        if (GLogger.enabled.has(options.logLevel)) {
            GLogger.getSheet().appendRow([
                options.logLevel,
                options.Context || "UNKNOWN",
                options.Info,
                time_1.default.getCurrentTime(),
            ]);
        }
    }
}
GLogger.enabled = new Set([
    LogLevels.CRITICAL,
    LogLevels.WARNING,
    LogLevels.ERROR,
    LogLevels.INFO,
]);
GLogger.sheetName = "LOGS_TABLES";
GLogger.header = ["Level", "Context", "Info", "CreateAt"];
exports.default = GLogger;
