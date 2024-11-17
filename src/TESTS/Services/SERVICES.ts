import Leads from "../../Entities/Leads";
import Services from "../../Services/services";
import AVLeadStatus from "../../Types/LeadStatus";

function TestProcessFromSheet() {
  Leads.getByStatus([AVLeadStatus.VALIDE]).map((lead) => {
    if (lead.Service) Services.current[lead.Service].processOrder(lead);
  });
}

function TestTrackCallCenterFromSheet() {
  Leads.getByStatus(
    [
      //System

      AVLeadStatus.SENT,

      //CALL CENTER
      AVLeadStatus.PENDING,
      AVLeadStatus.UNREACHED,
      AVLeadStatus.OUTOFSTOCK_CALL_CENTER,
      AVLeadStatus.A_TRANSFERER,

      //SHIPPING
      AVLeadStatus.CONFIRMED,
      AVLeadStatus.TOPREPARE,
      AVLeadStatus.OUTOFSTOCK_SHIPPING,
      AVLeadStatus.PREPARED,
      AVLeadStatus.SHIPPED,
      AVLeadStatus.REPROGRAMMER,
      AVLeadStatus.REMBOURSER,
      AVLeadStatus.DELIVERED,
      AVLeadStatus.PAID,
      AVLeadStatus.CANCELLED_SHIPPING,
      AVLeadStatus.REFUSED,
      AVLeadStatus.REMIND,
      AVLeadStatus.UNREACHHABLE,
    ],
    3600000
  ).map((lead) => {
    if (lead.Service) Services.current[lead.Service].trackOrder(lead);
  });
}
