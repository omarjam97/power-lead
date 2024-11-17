"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Leads_1 = __importDefault(require("../../Entities/Leads"));
const Client_1 = __importDefault(require("../../Entities/Client"));
const Cart_1 = __importDefault(require("../../Entities/Cart"));
const random_1 = __importDefault(require("../../Utils/random"));
const Sources_1 = require("../Sources");
const time_1 = __importDefault(require("../../Utils/time"));
class Woocommerce {
    constructor() {
        this.type = Sources_1.SourceTypes.WEBHOOK;
    }
    async execute(rawData, storeName) {
        // Add storeName parameter
        try {
            const order = JSON.parse(rawData); // Parse the JSON string
            // Client info (billing or shipping)
            const billing = order.billing;
            const shipping = order.shipping;
            var clientInfo = billing.phone
                ? billing
                : shipping.phone
                    ? shipping
                    : null;
            if (!clientInfo) {
                Logger.log("Missing client information (phone) in both billing and shipping.");
                return null;
            }
            const client = new Client_1.default({
                firstName: clientInfo.first_name,
                lastName: clientInfo.last_name,
                phone: clientInfo.phone,
                country: clientInfo.country,
                email: clientInfo.email || undefined, // Provide email if available, otherwise undefined
                city: clientInfo.city || undefined,
                address_1: `${clientInfo.address_1}`.trim() || undefined,
                address_2: `${clientInfo.address_2}`,
                state: clientInfo.state || undefined,
                company: clientInfo.company || undefined,
                postCode: clientInfo.postcode || undefined,
                customerIpAddress: order.customer_ip_address || undefined,
                customerUserAgent: order.customer_user_agent || undefined,
            });
            // Cart items
            const cartItems = order.line_items.map((item) => {
                return {
                    productId: item.product_id.toString(),
                    quantity: item.quantity,
                    variantId: item.variation_id !== 0 ? item.variation_id.toString() : undefined, // Variant ID if not 0, otherwise undefined
                };
            });
            const cart = new Cart_1.default(cartItems);
            const lead = await Leads_1.default.create({
                ID: `${storeName.substring(0, 3)}_${order.id}_${random_1.default.generateRandomString(5)}`,
                Store: storeName, // Extract store URL, // Pass the store name here
                Source: `Woocommerce_${this.type}`,
                Client: client,
                Country: order.billing.country || order.shipping.country, // Use billing country, or shipping if billing is missing
                PaymentMethod: order.payment_method,
                Cart: cart,
                Total: parseFloat(order.total),
                Currency: order.currency,
                Date: time_1.default.parseGMTtoUTC(order.date_created_gmt)
            });
            if (!lead) {
                Logger.log(`Failed to create lead for order ${order.id}`); // More specific error message
                return null;
            }
            return lead;
        }
        catch (error) {
            Logger.log(`Error processing WooCommerce order: `, JSON.stringify(error));
            return null; // Return null on error
        }
    }
}
exports.default = Woocommerce;
