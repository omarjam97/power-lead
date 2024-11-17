import Cart from "../../Entities/Cart";
import Client from "../../Entities/Client";
import Leads from "../../Entities/Leads";
import AVLeadStatus from "../../Types/LeadStatus";
import Time from "../../Utils/time";

async function createLead() {
  const lead = await Leads.create({
    ID: "test",
    Store: "store.com",
    Source: "webhook",
    Country: "MA",
    Currency: "CFA",
    PaymentMethod: "COD",
    Total: 1222,
    Date: Time.getCurrentTime(),
    Client: new Client({
      country: "MA",
      firstName: "test",
      phone: "0649333170",
    }),
    Cart: new Cart([
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
    const changedAt = Time.getCurrentTime(); // Get the current time for the status change

    try {
      lead.updateSystemStatus(
        {
          current : AVLeadStatus.PENDING,
          note :  "Order marked as pending TEST"
        }
      );
      Logger.log("Lead status updated to pending:", lead);

      // Logger.log("LEAD STATUS",leadez.getStatus());
    } catch (e) {
      Logger.log(`Error updating lead status: ${e}`);
    }
  } else {
    Logger.log("Lead creation failed.");
  }

  Logger.log(lead);
}

function TestValidateLeads(){
  Leads.getByStatus([AVLeadStatus.FRESH]).forEach((lead) => lead.validate());
}

// function TestStatus(){
//   Logger.log(LeadStatus.getLeadStatus(''));
// }