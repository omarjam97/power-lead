"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Global_1 = require("../../Global");
class ProductInfo {
    constructor(options) {
        this.Index = null; // Replaced ID with Index
        this.Index = options.Index;
        this.PRODUCT_ID = options.PRODUCT_ID;
        this.SKU = options.SKU;
        this.Service = options.Service;
        this.ServiceMeta = options.ServiceMeta;
        this.CurrentStock = options.CurrentStock;
        this.TotalStock = options.TotalStock;
        this.Country = options.Country;
        this.Price = options.Price;
    }
    static getSheet() {
        return Global_1.SS.getSheetByName(ProductInfo.sheetName);
    }
    static create(options) {
        const ss = ProductInfo.getSheet();
        const lastRow = ss.getLastRow();
        if (lastRow != 1) {
            const data = ss
                .getRange(2, 1, lastRow - 1, ProductInfo.header.length)
                .getValues();
            const existingProduct = data.some((row) => row[1] === options.PRODUCT_ID &&
                row[2] === options.SKU &&
                row[3] === options.Service &&
                row[7] === options.Country);
            if (existingProduct) {
                Logger.log("ProductInfo with the given PRODUCT_ID, SKU, Service, and Country already exists.");
                return null;
            }
        }
        const productInfo = new ProductInfo({
            Index: null,
            ...options,
            CurrentStock: 0,
            TotalStock: 0,
        });
        return productInfo;
    }
    save() {
        const ss = ProductInfo.getSheet();
        if (this.Index) {
            // Update
            try {
                ss.getRange(this.Index, 1, 1, this.toRow().length).setValues([
                    this.toRow(),
                ]);
                return true;
            }
            catch (error) {
                Logger.log(`Error updating ProductInfo at index ${this.Index}: ${error}`);
                return false;
            }
        }
        else {
            // Create
            try {
                this.Index = ss.getLastRow() + 1;
                ss.appendRow(this.toRow());
                return true;
            }
            catch (error) {
                Logger.log(`Error creating new ProductInfo : ${error}`);
                return false;
            }
        }
    }
    toRow() {
        return [
            this.Index, // Updated toRow
            this.PRODUCT_ID,
            this.SKU,
            this.Service,
            this.ServiceMeta,
            this.CurrentStock,
            this.TotalStock,
            this.Country,
            this.Price,
        ];
    }
    updateStock(currentStock, totalStock) {
        if (!this.Index) {
            Logger.log("Cannot update stock. ProductInfo has no index.");
            return false;
        }
        try {
            const ss = ProductInfo.getSheet();
            ss.getRange(this.Index, 6).setValue(currentStock); // CurrentStock is at column 6
            ss.getRange(this.Index, 7).setValue(totalStock); // TotalStock is at column 7
            // Update the object's properties as well
            this.CurrentStock = currentStock;
            this.TotalStock = totalStock;
            return true;
        }
        catch (error) {
            Logger.log(`Error updating stock for ProductInfo at index ${this.Index}: ${error}`);
            return false;
        }
    }
    static getAllByService(service, country) {
        const ss = ProductInfo.getSheet();
        const lastRow = ss.getLastRow();
        const data = ss
            .getRange(2, 1, lastRow - 1, ProductInfo.header.length)
            .getValues();
        const matchingProducts = [];
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (row[3] === service && (!country || row[7] === country)) {
                // Filter by service and optionally by country
                matchingProducts.push(new ProductInfo({
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
        return matchingProducts;
    }
}
ProductInfo.sheetName = "PRODUCT_INFO_TABLE";
ProductInfo.header = [
    "Index", // Updated header
    "PRODUCT_ID",
    "SKU",
    "Service",
    "ServiceMeta",
    "CurrentStock",
    "TotalStock",
    "Country",
    "Price",
];
exports.default = ProductInfo;
