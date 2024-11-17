"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumSources = exports.SourceTypes = void 0;
const Woocommerce_1 = __importDefault(require("./adapters/Woocommerce"));
var SourceTypes;
(function (SourceTypes) {
    SourceTypes["WEBHOOK"] = "WEBHOOK";
})(SourceTypes || (exports.SourceTypes = SourceTypes = {}));
var EnumSources;
(function (EnumSources) {
    EnumSources["WOOCOMMERCE"] = "WOOCOMMERCE";
})(EnumSources || (exports.EnumSources = EnumSources = {}));
class Sources {
    static getSource(source) {
        return Sources.POST[source];
    }
}
Sources.POST = {
    [EnumSources.WOOCOMMERCE]: new Woocommerce_1.default(),
};
exports.default = Sources;
