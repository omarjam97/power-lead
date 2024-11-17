class Cart {
  readonly products: cartItem[];

  constructor(products: cartItem[] = []) {
    this.products = products;
  }

  serialize() {
    return this.products
      .map((product) => {
        return `${product.productId}:${product.variantId || ""}:${
          product.quantity
        }`;
      })
      .join("|");
  }

  static unserialize(data: string): Cart {
    const products: cartItem[] = [];
    if (data) {
      // Handle empty string case
      const items = data.split("|");
      for (const item of items) {
        const parts = item.split(":");
        if (parts.length >= 2 && parts.length <= 3) {
          // Ensure valid data format
          const productId = parts[0];
          const variantId = parts[1] === "" ? undefined : parts[1]; // Handle optional variantId
          const quantity = parseInt(parts[2], 10);

          if (!isNaN(quantity)) {
            // Check if quantity is a valid number
            products.push({ productId, variantId, quantity });
          } else {
            console.error(
              `Invalid quantity value during unserialization: ${parts[2]}`
            );
            // Optionally throw an error or skip the invalid item
          }
        } else {
          console.error(`Invalid data format during unserialization: ${item}`);
          // Optionally throw an error or skip the invalid item
        }
      }
    }

    return new Cart(products);
  }
}

interface cartItem {
  productId: string;
  quantity: number;
  variantId?: string;
}

export default Cart;
