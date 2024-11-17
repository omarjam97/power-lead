import Leads, { LEADS_TRIGGERS } from "./Entities/Leads";
import Product from "./Entities/Products/Product";
import ProductInfo from "./Entities/Products/ProductInfo";
import StoreProducts from "./Entities/Products/StoreProducts";
import Stores from "./Entities/Stores";
import { SS } from "./Global";
import GLogger from "./Monitor/GLogger";
import Services, { SERVICES_TRIGGERS } from "./Services/services";
import Arrays from "./Utils/arrays";

const SHEETS = [
  Leads,
  Stores,
  StoreProducts,
  Product,
  ProductInfo,
  Services,
  GLogger,
];

const TRIGGERS = [LEADS_TRIGGERS, SERVICES_TRIGGERS];

function setup() {
  //SHEETS SETUP
  SHEETS.forEach((Sheet) => {
    let sheet = SS.getSheetByName(Sheet.sheetName);

    if (!sheet) {
      sheet = SS.insertSheet(Sheet.sheetName);
      sheet.appendRow(Sheet.header); // Add header row to new sheet
    } else {
      // Check and update headers if necessary
      const existingHeader = sheet
        .getRange(1, 1, 1, sheet.getLastColumn())
        .getValues()[0];

      if (!Arrays.arraysEqual(existingHeader, Sheet.header)) {
        sheet.getRange(1, 1, 1, Sheet.header.length).setValues([Sheet.header]);
      }

      // Delete unused columns
      if (sheet.getLastColumn() > Sheet.header.length) {
        sheet.deleteColumns(
          Sheet.header.length + 1,
          sheet.getLastColumn() - Sheet.header.length
        );
      }
    }
  });

  //Protect Sheets
  SHEETS.forEach((Sheet) => {
    let sheet = SS.getSheetByName(Sheet.sheetName);
    if (!sheet) return; // Skip if sheet not found

    // Remove all existing protections
    const protections = sheet.getProtections(
      SpreadsheetApp.ProtectionType.RANGE
    );
    protections.forEach((protection) => protection.remove());

    // Protect the entire sheet, allowing only the script to edit
    sheet
      .protect()
      .setDescription(`Protected by script - ${Sheet.sheetName}`)
      .addEditors([Session.getEffectiveUser().toString()]);
  });

  //TRIGGERS SETUP
  TRIGGERS.forEach((trigger) => {
    trigger();
  });

  Services.setup();
}
