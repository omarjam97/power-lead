"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Leads_1 = __importDefault(require("../../Entities/Leads"));
const services_1 = __importDefault(require("../../Services/services"));
const LeadStatus_1 = __importDefault(require("../../Types/LeadStatus"));
function TestProcessFromSheet() {
    Leads_1.default.getByStatus([LeadStatus_1.default.VALIDE]).map((lead) => {
        if (lead.Service)
            services_1.default.current[lead.Service].processOrder(lead);
    });
}
