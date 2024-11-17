"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Global_1 = require("../../Global");
const ProductInfo_1 = __importDefault(require("./ProductInfo"));
class Product {
    constructor(options) {
        this.Index = null; // Changed to number, similar to Stores
        // Updated options type
        this.Index = options.Index;
        this.Name = options.Name;
    }
    static getSheet() {
        return Global_1.SS.getSheetByName(Product.sheetName);
    }
    static create(name) {
        const ss = Product.getSheet();
        const lastRow = ss.getLastRow();
        if (lastRow != 1) {
            const data = ss
                .getRange(2, 1, lastRow - 1, Product.header.length)
                .getValues();
            const nameExists = data.some((row) => row[1].trim().toLowerCase() === name.trim().toLowerCase()); // Case-insensitive
            if (nameExists) {
                Logger.log(`Product with name "${name}" already exists.`);
                return null;
            }
        }
        return new Product({ Index: null, Name: name });
    }
    save() {
        const ss = Product.getSheet();
        if (this.Index) {
            // Update existing product
            try {
                ss.getRange(this.Index, 1, 1, this.toRow().length).setValues([
                    this.toRow(),
                ]);
                return true;
            }
            catch (error) {
                Logger.log(`Error updating Product at index ${this.Index}: ${error}`);
                return false;
            }
        }
        else {
            // Create new Product
            try {
                this.Index = ss.getLastRow() + 1;
                ss.appendRow(this.toRow());
                return true;
            }
            catch (error) {
                Logger.log(`Error creating new Product: ${error}`);
                return false;
            }
        }
    }
    toRow() {
        return [this.Index, this.Name];
    }
    static getProductInfo(productIndex, country) {
        const productInfoSheet = ProductInfo_1.default.getSheet();
        const lastRow = productInfoSheet.getLastRow();
        const data = productInfoSheet
            .getRange(2, 1, lastRow - 1, ProductInfo_1.default.header.length)
            .getValues();
        const matchingProducts = [];
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const productInfoCountry = row[7];
            // Check if PRODUCT_ID matches and country either matches or is not provided
            if (row[1] == productIndex &&
                (!country || productInfoCountry === country)) {
                matchingProducts.push(new ProductInfo_1.default({
                    Index: row[0],
                    PRODUCT_ID: row[1],
                    SKU: row[2],
                    Service: row[3],
                    ServiceMeta: row[4],
                    CurrentStock: row[5],
                    TotalStock: row[6],
                    Country: row[7],
                    Price: row[8],
                }));
            }
        }
        if (matchingProducts.length === 0) {
            Logger.log(`No ProductInfo found for Product with index ${productIndex}${country ? ` and country ${country}` : ""}`);
            return null;
        }
        return matchingProducts;
    }
}
Product.sheetName = "PRODUCTS_TABLE";
Product.header = ["Index", "Name"];
exports.default = Product;
