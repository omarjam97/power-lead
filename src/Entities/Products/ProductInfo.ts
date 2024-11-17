import Countries from "../../Config/countries";
import { SS } from "../../Global";
import currentServices from "../../Services/currentServices";
import Product from "./Product";

export default class ProductInfo {
  public Index: number | null = null; // Replaced ID with Index
  public PRODUCT_ID: string;
  public SKU: string;
  public Service: currentServices;
  public ServiceMeta: string;
  public CurrentStock: number;
  public TotalStock: number;
  public Country: Countries;
  public Price: number;
  public TEST_MODE: boolean;
  public ACTIVE: boolean;

  static sheetName: string = "PRODUCT_INFO_TABLE";

  static header: string[] = [
    "Index", // Updated header
    "PRODUCT_ID",
    "SKU",
    "Service",
    "ServiceMeta",
    "CurrentStock",
    "TotalStock",
    "Country",
    "Price",
    "TEST_MODE",
    "ACTIVE",
  ];

  constructor(options: {
    Index: number | null; // Updated constructor parameter
    PRODUCT_ID: string;
    SKU: string;
    Service: currentServices;
    ServiceMeta: string;
    CurrentStock: number;
    TotalStock: number;
    Country: Countries;
    Price: number;
    TEST_MODE: boolean;
    ACTIVE: boolean;
  }) {
    this.Index = options.Index;
    this.PRODUCT_ID = options.PRODUCT_ID;
    this.SKU = options.SKU;
    this.Service = options.Service;
    this.ServiceMeta = options.ServiceMeta;
    this.CurrentStock = options.CurrentStock;
    this.TotalStock = options.TotalStock;
    this.Country = options.Country;
    this.Price = options.Price;
    this.TEST_MODE = options.TEST_MODE;
    this.ACTIVE = options.ACTIVE;
  }

  static getSheet() {
    return SS.getSheetByName(
      ProductInfo.sheetName
    ) as GoogleAppsScript.Spreadsheet.Sheet;
  }

  static create(options: {
    PRODUCT_ID: string;
    SKU: string;
    Service: currentServices;
    ServiceMeta: string;
    Country: Countries;
    Price: number;
    TEST_MODE: boolean;
    ACTIVE: boolean;
  }): ProductInfo | null {
    const ss = ProductInfo.getSheet();
    const lastRow = ss.getLastRow();
    if (lastRow > 1) {
      const data = ss
        .getRange(2, 1, lastRow - 1, ProductInfo.header.length)
        .getValues();

      const existingProduct = data.some(
        (row) =>
          row[1] == options.PRODUCT_ID && // Product ID
          row[2] == options.SKU && // SKU
          row[3] == options.Service && // Service
          row[7] == options.Country // Country
      );

      if (existingProduct) {
        Logger.log(
          "ProductInfo with the given PRODUCT_ID, SKU, Service, and Country already exists."
        );
        return null;
      }
    }

    return new ProductInfo({
      Index: null,
      ...options,
      CurrentStock: 0,
      TotalStock: 0,
    });
  }

  save(): boolean {
    const ss = ProductInfo.getSheet();

    if (this.Index) {
      // Update
      try {
        ss.getRange(this.Index, 1, 1, this.toRow().length).setValues([
          this.toRow(),
        ]);
        return true;
      } catch (error) {
        Logger.log(
          `Error updating ProductInfo at index ${this.Index}: ${error}`
        );
        return false;
      }
    } else {
      // Create
      try {
        this.Index = ss.getLastRow() + 1;
        ss.appendRow(this.toRow());
        return true;
      } catch (error) {
        Logger.log(`Error creating new ProductInfo : ${error}`);
        return false;
      }
    }
  }

  toRow(): any[] {
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
      this.TEST_MODE,
      this.ACTIVE,
    ];
  }

  updateStock(currentStock: number, totalStock: number): boolean {
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
    } catch (error) {
      Logger.log(
        `Error updating stock for ProductInfo at index ${this.Index}: ${error}`
      );
      return false;
    }
  }

  static getAllByService(
    service: currentServices,
    country?: Countries
  ): ProductInfo[] {
    const ss = ProductInfo.getSheet();
    const lastRow = ss.getLastRow();
    const data = ss
      .getRange(2, 1, lastRow - 1, ProductInfo.header.length)
      .getValues();
    const matchingProducts: ProductInfo[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row[3] === service && (!country || row[7] === country)) {
        // Filter by service and optionally by country
        matchingProducts.push(
          new ProductInfo({
            Index: row[0],
            PRODUCT_ID: row[1],
            SKU: row[2],
            Service: row[3],
            ServiceMeta: row[4],
            CurrentStock: row[5],
            TotalStock: row[6],
            Country: row[7],
            Price: row[8],
            TEST_MODE: row[9],
            ACTIVE: row[10],
          })
        );
      }
    }

    return matchingProducts;
  }
}

function showAddProductInfoForm() {
  const products = Product.getAll().map((product) => ({
    id: product.Index,
    name: product.Name,
  })); // Get product IDs and names
  const services = Object.entries(currentServices).map(([name, id]) => ({
    name,
    id,
  })); // Get service names and IDs
  const countries = Object.values(Countries); // Get country names from enum

  const template = HtmlService.createTemplateFromFile(
    "HTML/Products/CreateProductInfo"
  );
  template.products = products;
  template.services = services;
  template.countries = countries;

  const html = template.evaluate().setWidth(400).setHeight(500); // Adjust height as needed
  SpreadsheetApp.getUi().showModalDialog(html, "Add Product Info");
}

function createProductInfo(productInfoData: any): {
  success: boolean;
  message: string;
} {
  try {
    const product = Product.getProductByIndex(productInfoData.productId);

    if (!product) {
      return { success: false, message: "Invalid Product selected." };
    }

    const productInfo = ProductInfo.create({
      PRODUCT_ID: productInfoData.productId,
      SKU: productInfoData.sku,
      Service: productInfoData.service,
      ServiceMeta: productInfoData.serviceMeta,
      Country: productInfoData.country,
      Price: parseFloat(productInfoData.price),
      TEST_MODE: productInfoData.testMode, // Get value from form
      ACTIVE: productInfoData.active, // Get value from form
    });

    if (!productInfo) {
      return {
        success: false,
        message:
          "Product info with these details already exists or invalid input.",
      };
    }

    if (productInfo.save()) {
      return { success: true, message: "Product Info created successfully!" };
    } else {
      return {
        success: false,
        message: "Error saving product info. Please try again.",
      };
    }
  } catch (error) {
    // Important: Catch any other potential errors in the server-side function
    Logger.log("Error creating Product Info: " + error);
    return { success: false, message: "An unexpected error occurred." }; // Return a generic error message to the client
  }
}
