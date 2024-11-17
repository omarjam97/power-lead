"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Global_1 = require("../Global");
const currentServices_1 = __importDefault(require("../Services/currentServices"));
const services_1 = __importDefault(require("../Services/services"));
const LeadStatus_1 = __importStar(require("../Types/LeadStatus"));
const Cart_1 = __importDefault(require("./Cart"));
const Client_1 = __importDefault(require("./Client"));
const Entity_1 = __importDefault(require("./Entity"));
// import LeadStatus from "./LeadStatus";
const StoreProducts_1 = __importDefault(require("./Products/StoreProducts"));
class Leads extends Entity_1.default {
    updateStatus(type, status) {
        var _a;
        const now = Date.now(); // Get timestamp only once
        this.statuses[type].unshift({
            prev: ((_a = this.statuses[type][0]) === null || _a === void 0 ? void 0 : _a.current) || null,
            current: status.current,
            date: now,
            note: status.note,
        });
        this.updateCurrentStatus();
    }
    updateSystemStatus(status) {
        this.updateStatus(LeadStatus_1.LEAD_STATUS_TYPES.GLOBAL, status);
    }
    updateBulkStatus(type, newStatuses) {
        if (this.currentStatus != LeadStatus_1.default.DEAD) {
            this.statuses[type] = newStatuses.map((status) => ({
                ...status,
                date: new Date(status.date).getTime(),
            })); // ensure consistent timestamp format
            this.updateCurrentStatus();
        }
    }
    updateCurrentStatus() {
        let latestStatus;
        for (const type in this.statuses) {
            const status = this.statuses[type][0];
            if (status && (!latestStatus || status.date > latestStatus.date)) {
                latestStatus = status;
            }
        }
        if (latestStatus) {
            this.currentStatus = latestStatus.current;
            this.statusTime = latestStatus.date;
        }
        else {
            this.currentStatus = null;
            this.statusTime = null;
        }
    }
    constructor(options) {
        super();
        this.Service = null;
        this.ServiceMetaData = null;
        // public CurrentStatus: LeadsStatus;
        // public StatusChangedAt: string;
        // public StatusIndexs: string | null = null;
        //NEW STATUS MECANISME
        this.currentStatus = null;
        this.statusTime = null; // Store as timestamp
        this.statuses = {
            [LeadStatus_1.LEAD_STATUS_TYPES.GLOBAL]: [],
            [LeadStatus_1.LEAD_STATUS_TYPES.CALL_CENTER]: [],
            [LeadStatus_1.LEAD_STATUS_TYPES.SHIPPING]: [],
        };
        this.ID = options.ID;
        this.Index = options.Index;
        this.Store = options.Store;
        this.Source = options.Source;
        this.Client = options.Client;
        this.Country = options.Country;
        this.PaymentMethod = options.PaymentMethod;
        this.Cart = options.Cart;
        this.Total = options.Total;
        this.Currency = options.Currency;
        this.Service = options.Service;
        this.ServiceMetaData = options.ServiceMetaData;
        this.Attemps = options.Attemps;
        this.CreatedAt = options.CreatedAt;
    }
    toRow() {
        return [
            this.ID,
            this.Index,
            this.Store,
            this.Source,
            this.Client.serialize(),
            this.Country,
            this.PaymentMethod,
            this.Cart.serialize(),
            this.Total,
            this.Currency,
            this.Service,
            this.ServiceMetaData,
            this.currentStatus,
            this.statusTime,
            JSON.stringify(this.statuses),
            this.Attemps.toString(),
            this.CreatedAt,
        ];
    }
    static fromRow(data) {
        const lead = new Leads({
            ID: data[0],
            Index: parseInt(data[1]),
            Store: data[2],
            Source: data[3],
            Client: Client_1.default.unserialize(data[4]),
            Country: data[5],
            PaymentMethod: data[6],
            Cart: Cart_1.default.unserialize(data[7]),
            Total: parseInt(data[8]),
            Currency: data[9],
            Service: data[10],
            ServiceMetaData: data[11],
            Attemps: parseInt(data[15]),
            CreatedAt: data[16],
        });
        lead.statuses = JSON.parse(data[12]);
        lead.currentStatus = data[13];
        lead.statusTime = data[14] ? new Date(data[14]).getTime() : null; // Parse date and store as timestamp
        return lead;
    }
    static getSheet() {
        return Global_1.SS.getSheetByName(Leads.sheetName);
    }
    static create(options) {
        var lock = LockService.getScriptLock();
        try {
            if (!lock.tryLock(60000)) {
                // Attempt to acquire lock with timeout
                return; // Important: Exit to avoid further execution within try block
            }
            var sheet = this.getSheet();
            var leadIndex = sheet.getLastRow() + 1;
            const lead = new Leads({
                ID: options.ID,
                Index: leadIndex,
                Store: options.Store,
                Source: options.Source,
                Client: options.Client,
                Country: options.Country,
                PaymentMethod: options.PaymentMethod,
                Cart: options.Cart,
                Total: options.Total,
                Currency: options.Currency,
                Service: null,
                ServiceMetaData: null,
                Attemps: 0,
                CreatedAt: options.Date,
            });
            lead.updateStatus(LeadStatus_1.LEAD_STATUS_TYPES.GLOBAL, {
                current: LeadStatus_1.default.FRESH,
                note: "FRESHLY CREATED LEAD",
            });
            sheet.appendRow(lead.toRow());
            return lead;
        }
        catch (e) {
            Logger.log(e);
        }
        finally {
            if (lock.hasLock()) {
                // Release the lock only if it was acquired
                lock.releaseLock();
            }
        }
    }
    save() {
        if (this.Index) {
            var lock = LockService.getScriptLock();
            try {
                if (!lock.tryLock(120000)) {
                    return; // Exit if lock cannot be acquired
                }
                var sheet = Leads.getSheet();
                var row = sheet
                    .getRange(this.Index, 1, 1, sheet.getLastColumn())
                    .getValues()[0];
                if (!row) {
                    Logger.log(`Could not find row with index ${this.Index}`);
                    return;
                }
                let existingLead = Leads.fromRow(row);
                // Only update these fields if they haven't been set yet
                if (!existingLead.Service) {
                    existingLead.Service = this.Service;
                }
                if (this.ServiceMetaData) {
                    existingLead.ServiceMetaData = this.ServiceMetaData;
                }
                // Always update these fields
                //check for status update
                if (existingLead.currentStatus !== this.currentStatus) {
                    existingLead.currentStatus = this.currentStatus;
                }
                sheet
                    .getRange(this.Index, 1, 1, existingLead.toRow().length)
                    .setValues([existingLead.toRow()]);
            }
            catch (e) {
                Logger.log(e);
            }
            finally {
                if (lock.hasLock()) {
                    lock.releaseLock();
                }
            }
        }
        else {
            Logger.log("Error: Cannot save lead without an index."); // Or throw an error if you prefer.
        }
    }
    // updateStatus(
    //   newStatus: LeadsStatus,
    //   changedAt: string,
    //   note: string | null = null
    // ) {
    //   try {
    //     if (this.Index) {
    //       if (this.CurrentStatus != newStatus) {
    //         const status = LeadStatus.add({
    //           prevStatus: this.CurrentStatus,
    //           currentStatus: newStatus,
    //           leadIndex: this.Index,
    //           time: changedAt,
    //           note: note,
    //         });
    //         this.StatusChangedAt = changedAt;
    //         this.CurrentStatus = newStatus;
    //         if (this.StatusIndexs) {
    //           if (this.StatusIndexs.length) {
    //             this.StatusIndexs = `${this.StatusIndexs}|${status?.Index}`;
    //           } else {
    //             this.StatusIndexs = `${status?.Index}`;
    //           }
    //         }
    //         this.save();
    //       }
    //     } else {
    //       throw new Error("lead with no index needs imidiate check");
    //     }
    //   } catch (e) {
    //   } finally {
    //   }
    // }
    addAttempt() {
        this.Attemps++;
    }
    static getByStatus(statuses, checkInterval = 0) {
        const ss = Leads.getSheet();
        const lastRow = ss.getLastRow();
        const data = ss
            .getRange(2, 1, lastRow - 1, Leads.header.length)
            .getValues();
        const statusColumnIndex = Leads.header.indexOf("CurrentStatus");
        const statusChangedAtColumnIndex = Leads.header.indexOf("StatusChangedAt");
        const now = new Date().getTime();
        const matchingLeads = data
            .filter((row) => {
            const statusTimestamp = new Date(row[statusChangedAtColumnIndex]).getTime(); //Added Time.parseTime here because the sheet may return a time that is no parseable by Date constructor
            return ((checkInterval == 0 || now - statusTimestamp > checkInterval) &&
                statuses.includes(row[statusColumnIndex]));
        })
            .map(Leads.fromRow); //Only create Lead objects after filtering
        return matchingLeads;
    }
    validate() {
        try {
            if (this.currentStatus != LeadStatus_1.default.FRESH) {
                //critical
                throw new Error("LEAD ALREADY VALIDATED OR DEAD");
            }
            let service = null;
            this.Cart.products.forEach((product) => {
                const productInfo = StoreProducts_1.default.getProduct(this.Store, product.productId, this.Country);
                if (!productInfo || (productInfo === null || productInfo === void 0 ? void 0 : productInfo.length) < 1) {
                    this.updateSystemStatus({
                        current: LeadStatus_1.default.DEAD,
                        note: `combo not found ${this.Store} ${product.productId} ${this.Country}`,
                    });
                    throw new Error("");
                }
                if (!service) {
                    service = productInfo[0].Service;
                }
                else if (service != productInfo[0].Service) {
                    this.updateSystemStatus({
                        current: LeadStatus_1.default.DEAD,
                        note: `Please make sure that all products in cart are from the same service`,
                    });
                    throw new Error("");
                }
            });
            if (!service || !(service in currentServices_1.default)) {
                this.updateSystemStatus({
                    current: LeadStatus_1.default.DEAD,
                    note: `Service NOT found for order ${this.Index} | ${this.ID} | ${this.Store}`,
                });
                throw new Error("");
            }
            this.updateSystemStatus({
                current: LeadStatus_1.default.VALIDE,
                note: "",
            });
            this.Service = service;
            this.ServiceMetaData =
                services_1.default.current[service].getDefaultMetaData();
            this.save();
        }
        catch (e) {
            if (e && (e === null || e === void 0 ? void 0 : e.message) && (e === null || e === void 0 ? void 0 : e.message) != "") {
                throw e;
            }
        }
    }
}
Leads.sheetName = "LEADS_TABLE";
Leads.header = [
    "ID",
    "Index",
    "Store",
    "Source",
    "ClientInfo",
    "Country",
    "PaymentMethod",
    "Cart",
    "Total",
    "Currency",
    "Service",
    "ServiceMetaData",
    "CurrentStatus",
    "StatusChangedAt",
    "Status",
    "Attemps",
    "CreatedAt",
];
exports.default = Leads;
