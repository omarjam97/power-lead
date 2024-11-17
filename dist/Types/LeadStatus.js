"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEAD_STATUS_TYPES = exports.COD_IN_AFRICA = exports.GLOBAL_STATUS = void 0;
var GLOBAL_STATUS;
(function (GLOBAL_STATUS) {
    GLOBAL_STATUS["FRESH"] = "Fresh";
    GLOBAL_STATUS["VALIDE"] = "Valide";
    GLOBAL_STATUS["DEAD"] = "Dead";
    GLOBAL_STATUS["SENT"] = "SENT";
    GLOBAL_STATUS["CHECK"] = "Check";
})(GLOBAL_STATUS || (exports.GLOBAL_STATUS = GLOBAL_STATUS = {}));
var COD_IN_AFRICA;
(function (COD_IN_AFRICA) {
    COD_IN_AFRICA["PENDING"] = "Pending";
    //COD IN AFRICA STATUS
    COD_IN_AFRICA["UNREACHED"] = "Unreached";
    COD_IN_AFRICA["OUTOFSTOCK"] = "OutOfStock";
    COD_IN_AFRICA["A_TRANSFERER"] = "A transf\u00E9rer";
    COD_IN_AFRICA["TOPREPARE"] = "to prepare";
    COD_IN_AFRICA["PREPARED"] = "prepared";
    COD_IN_AFRICA["SHIPPED"] = "shipped";
    COD_IN_AFRICA["REPROGRAMMER"] = "reprogrammer";
    COD_IN_AFRICA["REFUSED"] = "refused";
    COD_IN_AFRICA["PAID"] = "paid";
    COD_IN_AFRICA["DELIVERED"] = "delivered";
    COD_IN_AFRICA["DOUBLE"] = "Double";
    COD_IN_AFRICA["CONFIRMED"] = "Confirmed";
    COD_IN_AFRICA["CANCELLED"] = "Cancelled";
    COD_IN_AFRICA["PROCESSED"] = "Processed";
    COD_IN_AFRICA["RETURN"] = "Return";
})(COD_IN_AFRICA || (exports.COD_IN_AFRICA = COD_IN_AFRICA = {}));
var LEAD_STATUS_TYPES;
(function (LEAD_STATUS_TYPES) {
    LEAD_STATUS_TYPES["GLOBAL"] = "GLOBAL";
    LEAD_STATUS_TYPES["CALL_CENTER"] = "CALL_CENTER";
    LEAD_STATUS_TYPES["SHIPPING"] = "SHIPPING";
})(LEAD_STATUS_TYPES || (exports.LEAD_STATUS_TYPES = LEAD_STATUS_TYPES = {}));
const AVLeadStatus = { ...GLOBAL_STATUS, ...COD_IN_AFRICA };
exports.default = AVLeadStatus;
