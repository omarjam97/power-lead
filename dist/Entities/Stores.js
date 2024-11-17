"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Global_1 = require("../Global");
class Stores {
    constructor(options) {
        this.Index = null; // Add Index property
        this.Index = options.Index;
        this.Name = options.Name;
    }
    static getSheet() {
        return Global_1.SS.getSheetByName(Stores.sheetName);
    }
    static create(name) {
        return new Stores({
            Index: null,
            Name: name,
        });
    }
    static fromRow(data) {
        // Add type annotation
        return new Stores({
            Index: data[0],
            Name: data[1],
        });
    }
    toRow() {
        // Add type annotation
        return [this.Index, this.Name];
    }
    save() {
        // Returns true if successful, false otherwise
        const ss = Stores.getSheet();
        let nameExists = false;
        if (!this.Index) {
            // Only check for existing name when creating a new store
            const lastRow = ss.getLastRow();
            if (lastRow != 1) {
                const data = ss
                    .getRange(2, 1, lastRow - 1, Stores.header.length)
                    .getValues();
                nameExists = data.some((row) => row[1] === this.Name);
            }
        }
        if (nameExists) {
            Logger.log(`Store with name "${this.Name}" already exists.`);
            return false; // Indicate failure (duplicate name)
        }
        if (this.Index) {
            // Update existing store
            try {
                ss.getRange(this.Index, 1, 1, this.toRow().length).setValues([
                    this.toRow(),
                ]);
                return true;
            }
            catch (error) {
                Logger.log(`Error updating store at index ${this.Index}: ${error}`);
                return false;
            }
        }
        else {
            // Create new store
            try {
                this.Index = ss.getLastRow() + 1;
                ss.appendRow(this.toRow());
                return true;
            }
            catch (error) {
                Logger.log(`Error creating new store: ${error}`);
                return false;
            }
        }
    }
}
Stores.sheetName = "STORES_TABLE";
Stores.header = ["Index", "Name"];
function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu("Stores")
        .addItem("Add New Store", "showAddStoreForm")
        .addToUi();
}
function showAddStoreForm() {
    const html = HtmlService.createHtmlOutputFromFile("HTML/Products/AddStoreForm")
        .setWidth(300)
        .setHeight(200);
    SpreadsheetApp.getUi().showModalDialog(html, "Add New Store");
}
function addNewStore(storeName) {
    // Return store ID or null on error
    Logger.log("executed from FORM");
    const newStore = Stores.create(storeName);
    if (newStore) {
        // Check if the store was created successfully (not a duplicate)
        if (newStore.save()) {
            Logger.log("Store added successfully!");
            return true || null; // return index (ID) as a string if successful, otherwise null.
        }
        else {
            Logger.log("Failed to save store (unknown error).");
            return null;
        }
    }
    else {
        return null; // Duplicate store name, create failed
    }
}
exports.default = Stores;
