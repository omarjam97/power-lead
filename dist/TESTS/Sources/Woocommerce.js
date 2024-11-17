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
Object.defineProperty(exports, "__esModule", { value: true });
const Sources_1 = __importStar(require("../../Sources/Sources"));
async function testWoocommerceSource() {
    const sampleWoocommerceOrder = {
        id: 193,
        parent_id: 0,
        status: "processing",
        currency: "XAF",
        version: "9.3.3",
        prices_include_tax: false,
        date_created: "2024-11-02T21:38:18",
        date_modified: "2024-11-02T21:38:18",
        discount_total: "0.00",
        discount_tax: "0.00",
        shipping_total: "0.00",
        shipping_tax: "0.00",
        cart_tax: "0.00",
        total: "19900.00",
        total_tax: "0.00",
        customer_id: 0,
        order_key: "wc_order_19qQFmIDydDjk",
        billing: {
            first_name: "Test",
            last_name: "",
            company: "",
            address_1: "",
            address_2: "",
            city: "Test",
            state: "",
            postcode: "",
            country: "AL",
            email: "",
            phone: "123456789",
        },
        shipping: {
            first_name: "",
            last_name: "",
            company: "",
            address_1: "",
            address_2: "",
            city: "",
            state: "",
            postcode: "",
            country: "AL",
            phone: "",
        },
        payment_method: "cod",
        payment_method_title: "Paiement à la livraison",
        transaction_id: "",
        customer_ip_address: "80.246.28.22",
        customer_user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1",
        created_via: "",
        customer_note: "",
        date_completed: null,
        date_paid: null,
        cart_hash: "",
        number: "193",
        meta_data: [],
        line_items: [
            {
                id: 28,
                name: "Oxymetre Numérique de Doigt (Copie)",
                product_id: 175,
                variation_id: 0,
                quantity: 1,
                tax_class: "",
                subtotal: "19900.00",
                subtotal_tax: "0.00",
                total: "19900.00",
                total_tax: "0.00",
                taxes: [],
                meta_data: [],
                sku: "",
                price: 19900,
                image: {
                    id: "170",
                    src: "https://afriall.com/wp-content/uploads/2024/11/image-oxymetre.jpg",
                },
                parent_name: null,
            },
        ],
        tax_lines: [],
        shipping_lines: [],
        fee_lines: [],
        coupon_lines: [],
        refunds: [],
        payment_url: "https://afriall.com/commander/order-pay/193/?pay_for_order=true&key=wc_order_19qQFmIDydDjk",
        is_editable: false,
        needs_payment: false,
        needs_processing: true,
        date_created_gmt: "2024-11-02T21:38:18",
        date_modified_gmt: "2024-11-02T21:38:18",
        date_completed_gmt: null,
        date_paid_gmt: null,
        currency_symbol: "CFA",
        _links: {
            self: [
                {
                    href: "https://afriall.com/wp-json/wc/v3/orders/193",
                },
            ],
            collection: [
                {
                    href: "https://afriall.com/wp-json/wc/v3/orders",
                },
            ],
        },
    };
    const rawData = JSON.stringify(sampleWoocommerceOrder);
    const storeName = "teststore.com"; // Replace with your test store name
    const woocommerceSource = Sources_1.default.getSource(Sources_1.EnumSources.WOOCOMMERCE);
    try {
        const lead = await woocommerceSource.execute(rawData, storeName);
        if (lead) {
            Logger.log("WooCommerce lead created successfully:", lead);
            // Add assertions here to check the lead's properties
            // assertLeadProperties(lead, sampleWoocommerceOrder, storeName);
        }
        else {
            Logger.log("Failed to create WooCommerce lead.");
        }
    }
    catch (e) {
        Logger.log("Error in Woocommerce source execution:", e);
    }
}
