import Countries from "../../Config/countries";
import { SS } from "../../Global";
import Random from "../../Utils/random";
import Stores from "../Stores";
import Product from "./Product";
import ProductInfo from "./ProductInfo";

export default class StoreProducts {
  public Index: number | null = null; // Replaced ID with Index
  public Store: string;
  public ProductStoreId: string;
  public ProductId: string;
  public TOKEN: string;

  static sheetName: string = "STORES_PRODUCTS_TABLE";

  static header: string[] = [
    "Index", // Updated header
    "Store",
    "ProductStoreId",
    "ProductId",
    "TOKEN",
  ];

  constructor(options: {
    Index: number | null; // Updated constructor parameter
    Store: string;
    Product_Store_Id: string;
    Product_Id: string;
    Token?: string; // Token is optional in the constructor
  }) {
    this.Index = options.Index;
    this.Store = options.Store;
    this.ProductStoreId = options.Product_Store_Id;
    this.ProductId = options.Product_Id;
    this.TOKEN = options.Token || ""; // Initialize TOKEN if provided, otherwise empty string
  }

  static getSheet() {
    return SS.getSheetByName(
      StoreProducts.sheetName
    ) as GoogleAppsScript.Spreadsheet.Sheet;
  }

  static create(options: {
    Store: string;
    Product_Store_Id: string;
    Product_Id: string;
  }): StoreProducts | null {
    const ss = StoreProducts.getSheet();
    const lastRow = ss.getLastRow();
    if (lastRow != 1) {
      const data = ss
        .getRange(2, 1, lastRow - 1, StoreProducts.header.length)
        .getValues();

      const existingStoreProduct = data.some(
        (row) =>
          row[1] == options.Store &&
          row[2] == options.Product_Store_Id &&
          row[3] == options.Product_Id
      );

      if (existingStoreProduct) {
        Logger.log(
          "StoreProduct with the given Store, ProductStoreId, and ProductId already exists."
        );
        return null;
      }
    }

    const token = Random.generateRandomString(30); // Generate token here
    const storeProduct = new StoreProducts({
      Index: null,
      ...options,
      Token: token,
    });

    return storeProduct;
  }

  save(): boolean {
    const ss = StoreProducts.getSheet();

    if (this.Index) {
      // Update
      try {
        ss.getRange(this.Index, 1, 1, this.toRow().length).setValues([
          this.toRow(),
        ]);
        return true;
      } catch (error) {
        Logger.log(
          `Error updating StoreProduct at index ${this.Index}: ${error}`
        );
        return false;
      }
    } else {
      // Create
      try {
        this.Index = ss.getLastRow() + 1;
        if (!this.TOKEN) {
          // Generate token only if it doesn't exist
          this.TOKEN = Random.generateRandomString(30);
        }

        ss.appendRow(this.toRow());
        return true;
      } catch (error) {
        Logger.log(`Error creating new StoreProduct: ${error}`);
        return false;
      }
    }
  }

  // we use the product ID to match it in the Product hen we seacch based on the country if it exists and we return ProductInfo
  static getProduct(
    store: string,
    product_store_id: string,
    country: Countries
  ): ProductInfo[] | null {
    const ss = StoreProducts.getSheet();
    const lastRow = ss.getLastRow();
    const data = ss
      .getRange(2, 1, lastRow - 1, StoreProducts.header.length)
      .getValues();

    let productId: number | null = null;

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

    return Product.getProductInfo(productId, country);
  }

  toRow(): any[] {
    return [
      this.Index,
      this.Store,
      this.ProductStoreId,
      this.ProductId,
      this.TOKEN,
    ];
  }

  static getByStoreAndProductIds(
    store: string,
    productStoreId: string,
    productId: string
  ): StoreProducts | null {
    const ss = StoreProducts.getSheet();
    const lastRow = ss.getLastRow();

    if (lastRow > 1) {
      const data = ss
        .getRange(2, 1, lastRow - 1, StoreProducts.header.length)
        .getValues();

      const matchingRow = data.find(
        (row) =>
          row[1] == store && row[2] == productStoreId && row[3] == productId
      );

      if (matchingRow) {
        return new StoreProducts({
          Index: matchingRow[0],
          Store: matchingRow[1],
          Product_Store_Id: matchingRow[2],
          Product_Id: matchingRow[3],
          Token: matchingRow[4],
        });
      }
    }

    return null; // Not found
  }

  static detectToken(adName: string): { store: string; productStoreId: string } | null {
    const ss = StoreProducts.getSheet();
    const lastRow = ss.getLastRow();
    
    if (lastRow <= 1) return null; // No data in the sheet

    const data = ss.getRange(2, 1, lastRow - 1, StoreProducts.header.length).getValues();

    for (const row of data) {
      const token = row[4]; // Token is in the 5th column (index 4)
      if (adName.includes(token)) {
        return {
          store: row[1],      // Store is in the 2nd column (index 1)
          productStoreId: row[2] // ProductStoreId is in the 3rd column (index 2)
        };
      }
    }

    return null; // Token not found in any ad name
  }
}

function showAddStoreProductForm() {
  // Updated function name
  const stores_ = Stores.getAll().map((store) => ({
    id: store.Name,
    name: store.Name,
  })); // Get product IDs and names
  const products = Product.getAll().map((product) => ({
    id: product.Index,
    name: product.Name,
  })); // Get product IDs and names
  Logger.log(stores_);
  Logger.log(products);
  const template = HtmlService.createTemplateFromFile(
    "HTML/Products/AddProductStore"
  ); // Updated template path
  template.stores = stores_;
  template.products = products;
  const html = template.evaluate().setWidth(400).setHeight(400); // Adjust height as needed
  SpreadsheetApp.getUi().showModalDialog(html, "Add Store Product");
}

function createStoreProduct(storeProductData: any): {
  success: boolean;
  message: string;
} {
  try {
    const existingStoreProduct = StoreProducts.getByStoreAndProductIds(
      storeProductData.storeId,
      storeProductData.productStoreId,
      storeProductData.productId
    );

    if (existingStoreProduct) {
      return {
        success: false,
        message: "Store product with these details already exists.",
      };
    }
    const storeProduct = StoreProducts.create({
      Store: storeProductData.storeId, // Pass storeId
      Product_Store_Id: storeProductData.productStoreId,
      Product_Id: storeProductData.productId, // Pass ProductId
    });

    if (!storeProduct) {
      return {
        success: false,
        message:
          "Store product with these details already exists or invalid input.",
      };
    }

    if (storeProduct.save()) {
      return { success: true, message: "Store Product created successfully!" };
    } else {
      return {
        success: false,
        message: "Error saving store product. Please try again.",
      };
    }
  } catch (error) {
    Logger.log("Error creating Store Product: " + error);
    return { success: false, message: "An unexpected error occurred." };
  }
}
