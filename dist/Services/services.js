"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Global_1 = require("../Global");
const COD_IN_AFRICA_1 = __importDefault(require("./adapters/COD_IN_AFRICA"));
const currentServices_1 = __importDefault(require("./currentServices"));
class Services {
    constructor(options) {
        this.Index = null; // Allow null for new services
        // Use currentServices type for Name
        this.Index = options.Index;
        this.Name = options.Name;
    }
    toRow() {
        return [this.Index, this.Name];
    }
    fromRow(data) {
        // Specify return type
        return new Services({
            Index: parseInt(data[0]), // Parse index as number
            Name: data[1], // Cast to currentServices type
        });
    }
    static getSheet() {
        return Global_1.SS.getSheetByName(Services.sheetName);
    }
    static async add(name) {
        // Use currentServices as parameter type
        const ss = Services.getSheet();
        const lastRow = ss.getLastRow();
        if (lastRow != 1) {
            const data = ss
                .getRange(2, 1, lastRow - 1, Services.header.length)
                .getValues();
            const existingService = data.some((row) => row[1] === name);
            if (existingService) {
                Logger.log(`Service "${name}" already exists.`);
                return;
            }
        }
        const newService = new Services({ Index: null, Name: name });
        if (newService.save()) {
            Logger.log(`Service "${name}" added successfully.`);
        }
    }
    save() {
        // Return boolean indicating success
        const ss = Services.getSheet();
        if (this.Index) {
            // Update
            try {
                ss.getRange(this.Index, 1, 1, this.toRow().length).setValues([
                    this.toRow(),
                ]);
                return true;
            }
            catch (error) {
                Logger.log(`Error updating Service at index ${this.Index}: ${error}`);
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
                Logger.log(`Error creating new Service : ${error}`);
                return false;
            }
        }
    }
    static setup() {
        const servicesToAdd = Object.getOwnPropertyNames(Services.current);
        Logger.log("Settings SERVIVES");
        for (const serviceName of servicesToAdd) {
            Logger.log(JSON.stringify(serviceName));
            Services.add(serviceName); // Use this.add to call the static add method
        }
    }
}
Services.current = {
    [currentServices_1.default.COD_IN_AFRICA]: new COD_IN_AFRICA_1.default(),
};
Services.sheetName = "SERVICES_TABLE";
Services.header = ["Index", "Name"];
exports.default = Services;
