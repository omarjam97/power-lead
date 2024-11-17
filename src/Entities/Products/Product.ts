import Countries from "../../Config/countries";
import { SS } from "../../Global";
import ProductInfo from "./ProductInfo";

export default class Product {
  public Index: number | null = null; // Changed to number, similar to Stores
  public Name: string;
  static sheetName: string = "PRODUCTS_TABLE";

  static header: string[] = ["Index", "Name"];

  constructor(options: { Index: number | null; Name: string }) {
    // Updated options type
    this.Index = options.Index;
    this.Name = options.Name;
  }

  static getSheet() {
    return SS.getSheetByName(
      Product.sheetName
    ) as GoogleAppsScript.Spreadsheet.Sheet;
  }

  static create(name: string): Product | null {
    const ss = Product.getSheet();
    const lastRow = ss.getLastRow();
    if (lastRow != 1) {
      const data = ss
        .getRange(2, 1, lastRow - 1, Product.header.length)
        .getValues();

      const nameExists = data.some(
        (row) => row[1].trim().toLowerCase() === name.trim().toLowerCase()
      ); // Case-insensitive

      if (nameExists) {
        Logger.log(`Product with name "${name}" already exists.`);
        return null;
      }
    }
    return new Product({ Index: null, Name: name });
  }

  save(): boolean {
    const ss = Product.getSheet();

    if (this.Index) {
      // Update existing product
      try {
        ss.getRange(this.Index, 1, 1, this.toRow().length).setValues([
          this.toRow(),
        ]);
        return true;
      } catch (error) {
        Logger.log(`Error updating Product at index ${this.Index}: ${error}`);
        return false;
      }
    } else {
      // Create new Product

      try {
        this.Index = ss.getLastRow() + 1;
        ss.appendRow(this.toRow());
        return true;
      } catch (error) {
        Logger.log(`Error creating new Product: ${error}`);
        return false;
      }
    }
  }

  toRow(): any[] {
    return [this.Index, this.Name];
  }
  // Add this helper function to the Product class (Product.ts)
  static getProductByName(name: string): Product | null {
    const ss = Product.getSheet();
    const lastRow = ss.getLastRow();
    if (lastRow <= 1) {
      // Check for an empty data range first.
      return null;
    }
    const data = ss
      .getRange(2, 1, lastRow - 1, Product.header.length)
      .getValues();
    const matchingProductRow = data.find(
      (row) => row[1].trim().toLowerCase() === name.trim().toLowerCase()
    );

    return matchingProductRow
      ? new Product({
          Index: matchingProductRow[0],
          Name: matchingProductRow[1],
        })
      : null;
  }

  static getProductInfo(
    productIndex: number,
    country?: Countries
  ): ProductInfo[] | null {
    const productInfoSheet = ProductInfo.getSheet();
    const lastRow = productInfoSheet.getLastRow();
    const data = productInfoSheet
      .getRange(2, 1, lastRow - 1, ProductInfo.header.length)
      .getValues();
    const matchingProducts: ProductInfo[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const productInfoCountry = row[7];

      // Check if PRODUCT_ID matches and country either matches or is not provided
      if (
        row[1] == productIndex &&
        (!country || productInfoCountry === country)
      ) {
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
            TEST_MODE : row[9],
            ACTIVE : row[10]
          })
        );
      }
    }

    if (matchingProducts.length === 0) {
      Logger.log(
        `No ProductInfo found for Product with index ${productIndex}${
          country ? ` and country ${country}` : ""
        }`
      );
      return null;
    }

    return matchingProducts;
  }

  static getAll(): Product[] {
    const ss = Product.getSheet();
    const lastRow = ss.getLastRow();

    if (lastRow <= 1) {
      // Handle empty data range
      return [];
    }
    const data = ss
      .getRange(2, 1, lastRow - 1, Product.header.length)
      .getValues();
    return data.map((row) => new Product({ Index: row[0], Name: row[1] }));
  }

  static getProductByIndex(index: number): Product | null {
    const ss = Product.getSheet();
    const lastRow = ss.getLastRow();
    if (lastRow <= 1) return null; //No data

    const data = ss
      .getRange(2, 1, lastRow - 1, Product.header.length)
      .getValues();

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row[0] == index) {
        return new Product({ Index: row[0], Name: row[1] });
      }
    }

    return null;
  }
}

function createProduct(name: string) {
  // Return created product or null
  const existingProduct = Product.getProductByName(name); // Helper function to find existing products
  if (existingProduct) {
    return {
      success: false,
      message: `Product with name "${name}" already exists.`,
    };
  }

  const product = Product.create(name); // Provide the correct argument to Product.create
  if (product && product.save()) {
    return {
      success: true,
      message: "Product created successfully!",
      product: product,
    };
  } else {
    return {
      success: false,
      message: "Error creating product. Please try again.",
    };
  }
}

function ProductMenu() {
  SpreadsheetApp.getUi().createMenu("Products")
    .addItem("Add Product", "showAddProductForm") // Corrected function name
    .addItem("Add Product Info", "showAddProductInfoForm")
    .addItem("Link Product to store", "showAddStoreProductForm")
    .addToUi();
}

function showAddProductForm() {
  const html = HtmlService.createTemplateFromFile(
    "HTML/Products/CreateProduct.html"
  )
    .evaluate()
    .setWidth(400)
    .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, "Add Product");
}

export { ProductMenu };
