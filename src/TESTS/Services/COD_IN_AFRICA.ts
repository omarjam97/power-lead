import Cart from "../../Entities/Cart";
import Client from "../../Entities/Client";
import Leads from "../../Entities/Leads";
import ProductInfo from "../../Entities/Products/ProductInfo";
import COD_IN_AFRICA_SERVICE from "../../Services/adapters/COD_IN_AFRICA";
import currentServices from "../../Services/currentServices";
import Random from "../../Utils/random";
import Time from "../../Utils/time";

function testCODINAFricaserviceProcessOrder() {
  // 1. Create a test lead
  const testLead = createTestLead();

  // 2. Call processOrder
  const codInAfricaService = new COD_IN_AFRICA_SERVICE();

  // Make sure the product exists in StoreProducts and ProductInfo

  const processedLead = codInAfricaService.processOrder(testLead);

  // 3. Assertions
  if (processedLead) {
    Logger.log("Lead processed successfully:", processedLead);

    // Add more assertions as needed based on the expected changes to the lead after processing
    // For example, check properties updated by the service, status changes, attempts, etc.
  } else {
    Logger.log("Lead processing failed.");

    // Check for failure scenarios (e.g., error logs, lead status, attempts, etc.)
    // Example: Assert.assertEquals(testLead.Attemps, 1); // Check if attempts were incremented
  }
}

function createTestLead(): Leads {
  const client = new Client({
    firstName: "Test",
    lastName: "User",
    phone: "1234567890",
    country: "BF", // Or any valid country code
    email: "test@example.com",
    city: "Test City",
    address_1: "Test Address 1",
    address_2: "Test Address 2",
    state: "Test State",
    company: "Test Company",
    postCode: "12345",
    customerIpAddress: "127.0.0.1",
    customerUserAgent: "Test User Agent",
  });

  const cart = new Cart([
    { productId: "1", quantity: 1 }, // Use valid product and variant IDs if needed
  ]);

  const lead = Leads.create({
    ID: `TEST_${Random.generateRandomString(5)}`,
    Store: "Afriall",
    Source: "WOO",
    Client: client,
    Country: "BF", // Use a valid country code from your enum
    PaymentMethod: "cod", // Or any other valid payment method
    Cart: cart,
    Total: 19880,
    Currency: "XFA", // Or any other valid currency code
    Date: Time.getCurrentTime()
  });

  if (!lead) {
    throw new Error("Failed to create test Lead.");
  }
  return lead;
}

function testTrackStock() {
  // 2. Call processOrder
  const codInAfricaService = new COD_IN_AFRICA_SERVICE();

  codInAfricaService.trackStock(
    ProductInfo.getAllByService(currentServices.COD_IN_AFRICA)
  );
}