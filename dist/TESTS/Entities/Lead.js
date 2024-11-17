"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Cart_1 = __importDefault(require("../../Entities/Cart"));
const Client_1 = __importDefault(require("../../Entities/Client"));
const Leads_1 = __importDefault(require("../../Entities/Leads"));
const LeadStatus_1 = __importDefault(require("../../Types/LeadStatus"));
const time_1 = __importDefault(require("../../Utils/time"));
async function createLead() {
    const lead = await Leads_1.default.create({
        ID: "test",
        Store: "store.com",
        Source: "webhook",
        Country: "MA",
        Currency: "CFA",
        PaymentMethod: "COD",
        Total: 1222,
        Date: time_1.default.getCurrentTime(),
        Client: new Client_1.default({
            country: "MA",
            firstName: "test",
            phone: "0649333170",
        }),
        Cart: new Cart_1.default([
            {
                productId: "1",
                quantity: 2,
                variantId: undefined,
            },
            {
                productId: "2",
                quantity: 1,
                variantId: "12",
            },
        ]),
    });
    if (lead) {
        // Check if lead creation was successful
        Logger.log("Lead created successfully:", lead);
        const changedAt = time_1.default.getCurrentTime(); // Get the current time for the status change
        try {
            lead.updateSystemStatus({
                current: LeadStatus_1.default.PENDING,
                note: "Order marked as pending TEST"
            });
            Logger.log("Lead status updated to pending:", lead);
            // Logger.log("LEAD STATUS",leadez.getStatus());
        }
        catch (e) {
            Logger.log(`Error updating lead status: ${e}`);
        }
    }
    else {
        Logger.log("Lead creation failed.");
    }
    Logger.log(lead);
}
function TestValidateLeads() {
    Leads_1.default.getByStatus([LeadStatus_1.default.FRESH], 60 * 1000).forEach((lead) => lead.validate());
}
// function TestStatus(){
//   Logger.log(LeadStatus.getLeadStatus(''));
// }
