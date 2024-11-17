import Leads from "../../Entities/Leads";
import Client from "../../Entities/Client";
import Cart from "../../Entities/Cart";
import Random from "../../Utils/random";
import { Source, SourceTypes } from "../Sources";
import Time from "../../Utils/time";
import GLogger from "../../Monitor/GLogger";

class Woocommerce implements Source {
  readonly type = SourceTypes.WEBHOOK;

  async execute(rawData: string, storeName: string): Promise<Leads | null> {
    // Add storeName parameter
    try {
      const order: WooCommerceOrder = JSON.parse(rawData); // Parse the JSON string

      // Client info (billing or shipping)
      const billing = order.billing;
      const shipping = order.shipping;

      var clientInfo: any = billing.phone
        ? billing
        : shipping.phone
        ? shipping
        : null;

      if (!clientInfo) {
        GLogger.critical({
          Context: `${this.type}_WOOCOMMERCE_SERVICE`,
          Info: `Missing client information (phone) in both billing and shipping. ${JSON.stringify(
            rawData
          )}`,
        });
        return null;
      }

      const client = new Client({
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
          variantId:
            item.variation_id !== 0 ? item.variation_id.toString() : undefined, // Variant ID if not 0, otherwise undefined
        };
      });

      const cart = new Cart(cartItems);
      const lead = Leads.create({
        ID: `${storeName.substring(0, 3)}_${
          order.id
        }_${Random.generateRandomString(5)}`,
        Store: storeName, // Extract store URL, // Pass the store name here
        Source: `Woocommerce_${this.type}`,
        Client: client,
        Country: order.billing.country || order.shipping.country, // Use billing country, or shipping if billing is missing
        PaymentMethod: order.payment_method,
        Cart: cart,
        Total: parseFloat(order.total),
        Currency: order.currency,
        Date: Time.parseGMTtoUTC(order.date_created_gmt),
      });

      if (!lead) {
        GLogger.critical({
          Context: `${this.type}_WOOCOMMERCE_SERVICE`,
          Info: `Failed to create lead for order ${
            order.id
          } |  ${JSON.stringify(rawData)}`,
        });
        return null;
      }

      return lead;
      
    } catch (error) {
      GLogger.critical({
        Context: `${this.type}_WOOCOMMERCE_SERVICE`,
        Info: `Error processing WooCommerce order: ${JSON.stringify(
          error
        )} | ${JSON.stringify(rawData)}`,
      });
      return null;
    }
  }
}

export default Woocommerce;

interface WooCommerceOrder {
  id: number;
  parent_id: number;
  status: string;
  currency: string;
  version: string;
  prices_include_tax: boolean;
  date_created: string;
  date_modified: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  customer_id: number;
  order_key: string;
  billing: WooCommerceAddress;
  shipping: Omit<WooCommerceAddress, "email">;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  customer_ip_address: string;
  customer_user_agent: string;
  created_via: string;
  customer_note: string;
  date_completed: string | null;
  date_paid: string | null;
  cart_hash: string;
  number: string;
  meta_data: any[]; // You might want to define a specific type for meta data
  line_items: WooCommerceLineItem[];
  tax_lines: any[]; // Define a specific type if needed
  shipping_lines: any[]; // Define a specific type if needed
  fee_lines: any[]; // Define a specific type if needed
  coupon_lines: any[]; // Define a specific type if needed
  refunds: any[]; // Define a specific type if needed
  payment_url: string;
  is_editable: boolean;
  needs_payment: boolean;
  needs_processing: boolean;
  date_created_gmt: string;
  date_modified_gmt: string;
  date_completed_gmt: string | null;
  date_paid_gmt: string | null;
  currency_symbol: string;
  _links: {
    self: { href: string }[];
    collection: { href: string }[];
  };
}

interface WooCommerceAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

interface WooCommerceLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  tax_class: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  taxes: any[]; // Define a specific type if needed
  meta_data: any[]; // Define a specific type if needed
  sku: string;
  price: number;
  image?: {
    //image is optional
    id: string;
    src: string;
  };
  parent_name: string | null;
}

export { WooCommerceAddress, WooCommerceOrder, WooCommerceLineItem };
