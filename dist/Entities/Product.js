"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreProducts = exports.ProductInfo = exports.Product = void 0;
const Global_1 = require("../Global"); // Import your SS object
class ProductInfo {
    constructor(options) {
        this.ID = options.ID;
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
}
exports.ProductInfo = ProductInfo;
ProductInfo.sheetName = "PRODUCT_INFO_TABLE";
ProductInfo.header = [
    "ID",
    "PRODUCT_ID",
    "SKU",
    "Service",
    "ServiceMeta",
    "CurrentStock",
    "TotalStock",
    "Country",
    "Price",
];
class Product {
    constructor(options) {
        this.ID = options.ID;
        this.Name = options.Name;
    }
    static getSheet() {
        return Global_1.SS.getSheetByName(Product.sheetName);
    }
    static getProductInfoById(id, country) {
        const productInfoSheet = ProductInfo.getSheet();
        const lastRowInfo = productInfoSheet.getLastRow();
        const data = productInfoSheet
            .getRange(2, 1, lastRowInfo - 1, ProductInfo.header.length)
            .getValues();
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (row[1] === id && row[7] === country) {
                // Check Product ID and Country (Product ID at index 1)
                return new ProductInfo({
                    ID: row[0],
                    PRODUCT_ID: row[1], // Added PRODUCT_ID
                    SKU: row[2],
                    Service: row[3],
                    ServiceMeta: row[4],
                    CurrentStock: row[5],
                    TotalStock: row[6],
                    Country: row[7],
                    Price: row[8],
                });
            }
        }
        return null; // Return null if no matching product info is found
    }
    static getAllProductsByService(service) {
        const productInfoSheet = ProductInfo.getSheet();
        const lastRow = productInfoSheet.getLastRow();
        const data = productInfoSheet
            .getRange(2, 1, lastRow - 1, ProductInfo.header.length)
            .getValues();
        const matchingProducts = [];
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (row[3] === service) {
                // Service is at index 3
                matchingProducts.push(new ProductInfo({
                    ID: row[0],
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
    static updateProductInfoStock(productInfoId, // Use lowercase first letter for parameter names
    sku, country, currentStock, totalStock) {
        // Return a boolean indicating success/failure
        const productInfoSheet = ProductInfo.getSheet();
        const lastRow = productInfoSheet.getLastRow();
        const data = productInfoSheet
            .getRange(2, 1, lastRow - 1, ProductInfo.header.length)
            .getValues();
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (row[0] === productInfoId && row[2] === sku && row[7] == country) {
                // Check ID and SKU
                const rowToUpdate = i + 2; // +2 to account for header row and 0-based index
                // Update stock values in the sheet directly for efficiency
                productInfoSheet.getRange(rowToUpdate, 6).setValue(currentStock); // CurrentStock is at index 6 (5 +1 for base 1 index)
                productInfoSheet.getRange(rowToUpdate, 7).setValue(totalStock); // TotalStock is at index 7 (6 + 1 for base 1 index)
                return true; // Indicate success
            }
        }
        return false; // Indicate failure (product info not found)
    }
}
exports.Product = Product;
Product.sheetName = "PRODUCTS_TABLE";
Product.header = ["ID", "Name"];
class StoreProducts {
    constructor(options) {
        this.ID = options.ID;
        this.Store = options.Store;
        this.ProductStoreId = options.Product_Store_Id;
        this.ProductId = options.Product_Id;
        this.TOKEN = options.Token;
    }
    static getSheet() {
        return Global_1.SS.getSheetByName(StoreProducts.sheetName);
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
            if (row[1] === store && row[2] === product_store_id) {
                productId = row[3];
                break;
            }
        }
        if (!productId) {
            return null;
        }
        return Product.getProductInfoById(productId, country);
    }
}
exports.StoreProducts = StoreProducts;
StoreProducts.sheetName = "STORES_PRODUCTS_TABLE";
StoreProducts.header = [
    "ID",
    "Store",
    "ProductStoreId",
    "ProductId",
    "TOKEN",
];
