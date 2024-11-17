"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const countries_1 = __importDefault(require("../../Config/countries"));
const Product_1 = __importDefault(require("../../Entities/Products/Product"));
const ProductInfo_1 = __importDefault(require("../../Entities/Products/ProductInfo"));
const StoreProducts_1 = __importDefault(require("../../Entities/Products/StoreProducts"));
const Stores_1 = __importDefault(require("../../Entities/Stores"));
const currentServices_1 = __importDefault(require("../../Services/currentServices"));
function testCreateStoresAndProducts() {
    const numStores = 3;
    const numProductsPerStore = 5;
    // Create stores
    const stores = [];
    for (let i = 0; i < numStores; i++) {
        const storeName = `Store ${String.fromCharCode(65 + i)}`; // Store A, Store B, etc.
        const store = Stores_1.default.create(storeName);
        if (store && store.save()) {
            stores.push(store);
        }
        else {
            Logger.log(`Failed to create or save store: ${storeName}`);
        }
    }
    // Create products and associated data
    for (let i = 0; i < numProductsPerStore; i++) {
        const productName = `Product ${i + 1}`;
        const product = Product_1.default.create(productName);
        if (product && product.save()) {
            // Create ProductInfo for each service and country combination
            const services = Object.values(currentServices_1.default); // Get all service values
            for (const service of services) {
                for (const country in countries_1.default) {
                    if (isNaN(Number(country))) {
                        //Check if is valid country
                        const productInfo = ProductInfo_1.default.create({
                            PRODUCT_ID: product.Index.toString(),
                            SKU: `SKU-${product.Name}-${service}-${country}`, // Include service in SKU
                            Service: service,
                            ServiceMeta: `Meta-${service}-${country}`,
                            Country: country,
                            Price: parseFloat("19900"),
                        });
                        if (productInfo) {
                            if (!productInfo.save()) {
                                Logger.log(`Failed to save ProductInfo for ${product.Name}, ${service}, ${country}`);
                            }
                        }
                    }
                }
            }
            // Create StoreProducts for each store
            for (const store of stores) {
                const storeProduct = StoreProducts_1.default.create({
                    Store: store.Name,
                    Product_Store_Id: `store-${store.Name}-product-${product.Index}`, // Include store name in ID
                    Product_Id: product.Index.toString(),
                });
                if (storeProduct) {
                    if (!storeProduct.save()) {
                        Logger.log(`Failed to save StoreProduct for ${store.Name}, ${product.Name}`);
                    }
                }
            }
        }
        else {
            Logger.log(`Failed to create or save product: ${productName}`);
        }
    }
}
function testFetchStoresAndProducts() {
    // Test fetching data
    const storeName = "Afriall"; // Replace with an existing store name
    const productStoreId = `1`; // Replace with an existing ProductStoreId
    const country = countries_1.default.BF; // Replace with a valid country
    const service = currentServices_1.default.COD_IN_AFRICA; // Replace with a valid service
    // Get StoreProducts
    const storeProducts = StoreProducts_1.default.getProduct(storeName, productStoreId, country);
    if (storeProducts) {
        Logger.log(`StoreProducts for ${storeName}, ${productStoreId}, ${country}:`);
        JSON.stringify(storeProducts.forEach((e) => Logger.log(JSON.stringify(e))));
    }
    else {
        Logger.log(`No StoreProducts found for ${storeName}, ${productStoreId}, ${country}`);
    }
    // Get ProductInfo by product index and country
    const productIndex = 2; // Replace with an existing product index
    const productInfos = Product_1.default.getProductInfo(productIndex, country);
    if (productInfos) {
        Logger.log(`ProductInfo for product index ${productIndex} and country ${country}:`);
        JSON.stringify(productInfos.forEach((e) => Logger.log(JSON.stringify(e))));
    }
    else {
        Logger.log(`No ProductInfo found for product index ${productIndex} and country ${country}`);
    }
    // Get ProductInfo by service (and optionally country)
    const productInfosByService = ProductInfo_1.default.getAllByService(service, country); // Optionally add country
    Logger.log(`ProductInfo for service ${service}${country ? ` and country ${country}` : ""}:`);
    JSON.stringify(productInfosByService.forEach((e) => Logger.log(JSON.stringify(e))));
    // Get Product by name
    const productName = "Anti Age"; // Replace with an existing product name
    const productSheet = Product_1.default.getSheet();
    const productData = productSheet.getDataRange().getValues();
    for (let i = 1; i < productData.length; i++) {
        // Start from row 2 (index 1) to skip header
        const row = productData[i];
        if (row[1] === productName) {
            const product = new Product_1.default({ Index: row[0], Name: row[1] });
            Logger.log(`Product with name "${productName}":`, product);
            break; // Exit loop after finding the product
        }
    }
}
