export enum GLOBAL_STATUS {
  FRESH = "Fresh",
  VALIDE = "Valide",
  DEAD = "Dead",
  SENT = "Sent",  
  CHECK = "Check",


  TEST = "Test",
  PRODUCT_DISABLED = "Product_Disabled",
}

export enum COD_IN_AFRICA {
  
  //COD IN AFRICA STATUS
  
  //SHARED
  DOUBLE = "double",
  
  //CALL CENTER STATUS
  PENDING = "Pending",
  UNREACHED = "Unreached",
  TO_REMIND = "ToRemind",
  OUTOFSTOCK_CALL_CENTER = "OutOfStock",
  A_TRANSFERER = "A transférer",
  
  //end STATUS CALL CENTER
  SPAM = "Spam",
  CANCELLED_CALL_CENTER = "Cancelled", 
  UNREACHED_END = "Unreached_end",
  CONFIRMED = "Confirmed",
  
  //SHIPPING CENTER STATUS
  TOPREPARE = "to prepare",
  OUTOFSTOCK_SHIPPING = "outofstock",
  PREPARED = "prepared",
  SHIPPED = "shipped",
  REPROGRAMMER = "reprogrammer",
  REMBOURSER = "rembourser",
  DELIVERED = "delivered",
  PAID = "paid",
  CANCELLED_SHIPPING = "cancelled",
  REFUSED = "refused",
  REMIND = "remind",
  UNREACHHABLE = "unreachable",

  //END STATUS SHIPPING
  PROCESSED = "processed",
  RETURN = "return",


}

enum LEAD_STATUS_TYPES {
  GLOBAL = "GLOBAL",
  CALL_CENTER = "CALL_CENTER",
  SHIPPING = "SHIPPING",
}
interface LeadStatus {
  prev: LeadsStatus | null;
  current: LeadsStatus;
  date: number; // Store dates as timestamps for faster comparisons
  note: string;
}

type StatusMap = {
  [LEAD_STATUS_TYPES.GLOBAL]: LeadStatus[];
  [LEAD_STATUS_TYPES.CALL_CENTER]: LeadStatus[];
  [LEAD_STATUS_TYPES.SHIPPING]: LeadStatus[];
};

const AVLeadStatus = { ...GLOBAL_STATUS, ...COD_IN_AFRICA };

type TAnimalsKeys = keyof typeof AVLeadStatus;
type LeadsStatus = (typeof AVLeadStatus)[TAnimalsKeys];

export default AVLeadStatus;

export type { LeadsStatus, LeadStatus, StatusMap };
export { LEAD_STATUS_TYPES };
