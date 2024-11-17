"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Leads_1 = __importDefault(require("./Entities/Leads"));
const Product_1 = __importDefault(require("./Entities/Products/Product"));
const ProductInfo_1 = __importDefault(require("./Entities/Products/ProductInfo"));
const StoreProducts_1 = __importDefault(require("./Entities/Products/StoreProducts"));
const Stores_1 = __importDefault(require("./Entities/Stores"));
const Global_1 = require("./Global");
const GLogger_1 = __importDefault(require("./Monitor/GLogger"));
const services_1 = __importDefault(require("./Services/services"));
const SHEETS = [
    Leads_1.default,
    Stores_1.default,
    StoreProducts_1.default,
    Product_1.default,
    ProductInfo_1.default,
    services_1.default,
    GLogger_1.default
];
function setup() {
    SHEETS.forEach((Sheet) => {
        let sheet = Global_1.SS.getSheetByName(Sheet.sheetName);
        if (!sheet) {
            sheet = Global_1.SS.insertSheet(Sheet.sheetName);
            sheet.appendRow(Sheet.header); // Add header row to new sheet
        }
        else {
            // Check and update headers if necessary
            const existingHeader = sheet
                .getRange(1, 1, 1, sheet.getLastColumn())
                .getValues()[0];
            if (!arraysEqual(existingHeader, Sheet.header)) {
                sheet.getRange(1, 1, 1, Sheet.header.length).setValues([Sheet.header]);
            }
            // Delete unused columns
            if (sheet.getLastColumn() > Sheet.header.length) {
                sheet.deleteColumns(Sheet.header.length + 1, sheet.getLastColumn() - Sheet.header.length);
            }
        }
    });
    services_1.default.setup();
}
function arraysEqual(a, b) {
    if (a === b)
        return true;
    if (a == null || b == null)
        return false;
    if (a.length !== b.length)
        return false;
    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i])
            return false;
    }
    return true;
}
