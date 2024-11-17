"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Global_1 = require("../../Global");
const random_1 = __importDefault(require("../../Utils/random"));
const Product_1 = __importDefault(require("./Product"));
class StoreProducts {
    constructor(options) {
        this.Index = null; // Replaced ID with Index
        this.Index = options.Index;
        this.Store = options.Store;
        this.ProductStoreId = options.Product_Store_Id;
        this.ProductId = options.Product_Id;
        this.TOKEN = options.Token || ""; // Initialize TOKEN if provided, otherwise empty string
    }
    static getSheet() {
        return Global_1.SS.getSheetByName(StoreProducts.sheetName);
    }
    static create(options) {
        const ss = StoreProducts.getSheet();
        const lastRow = ss.getLastRow();
        if (lastRow != 1) {
            const data = ss
                .getRange(2, 1, lastRow - 1, StoreProducts.header.length)
                .getValues();
            const existingStoreProduct = data.some((row) => row[1] === options.Store &&
                row[2] === options.Product_Store_Id &&
                row[3] === options.Product_Id);
            if (existingStoreProduct) {
                Logger.log("StoreProduct with the given Store, ProductStoreId, and ProductId already exists.");
                return null;
            }
        }
        const token = random_1.default.generateRandomString(30); // Generate token here
        const storeProduct = new StoreProducts({
            Index: null,
            ...options,
            Token: token,
        });
        return storeProduct;
    }
    save() {
        const ss = StoreProducts.getSheet();
        if (this.Index) {
            // Update
            try {
                ss.getRange(this.Index, 1, 1, this.toRow().length).setValues([
                    this.toRow(),
                ]);
                return true;
            }
            catch (error) {
                Logger.log(`Error updating StoreProduct at index ${this.Index}: ${error}`);
                return false;
            }
        }
        else {
            // Create
            try {
                this.Index = ss.getLastRow() + 1;
                if (!this.TOKEN) {
                    // Generate token only if it doesn't exist
                    this.TOKEN = random_1.default.generateRandomString(30);
                }
                ss.appendRow(this.toRow());
                return true;
            }
            catch (error) {
                Logger.log(`Error creating new StoreProduct: ${error}`);
                return false;
            }
        }
    }
    // we use the product ID to match it in the Product hen we seacch based on the country if it exists and we return ProductInfo
    static getProduct(store, product_store_id, country) {
        const ss = StoreProducts.getSheet();
        const lastRow = ss.getLastRow();
        const data = ss
            .getRange(2, 1, lastRow - 1, StoreProducts.header.length)
            .getValues();
        let productId = null;
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (row[1] == store && parseInt(row[2]) == parseInt(product_store_id)) {
                productId = row[3];
                break;
            }
        }
        if (!productId) {
            return null;
        }
        return Product_1.default.getProductInfo(productId, country);
    }
    toRow() {
        return [
            this.Index,
            this.Store,
            this.ProductStoreId,
            this.ProductId,
            this.TOKEN,
        ];
    }
}
StoreProducts.sheetName = "STORES_PRODUCTS_TABLE";
StoreProducts.header = [
    "Index", // Updated header
    "Store",
    "ProductStoreId",
    "ProductId",
    "TOKEN",
];
exports.default = StoreProducts;
