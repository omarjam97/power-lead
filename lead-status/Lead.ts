// enum LEAD_STATUS_TYPES {
//   GLOBAL = "GLOBAL",
//   CALL_CENTER = "CALL_CENTER",
//   SHIPPING = "SHIPPING",
// }

// enum LEAD_STATUS {
//   FRESH = "FRESH",
//   VALIDE = "VALIDE",
//   SENT = "SENT",

//   DEAD = "DEAD",

//   PENDING = "PENDING",
//   CONFIRMED = "CONFIRMED",


//   SHIPPED = "SHIPPED"
// }

// interface LeadStatus {
//   prev: LEAD_STATUS | null;
//   current: LEAD_STATUS;
//   date: string;
//   note: string;
// }

// class LeadStatusManager {
//   static serialze(
//     GLOBAL_STATUS: LeadStatus[],
//     CALL_CENTER_STATUS: LeadStatus[],
//     SHIPPING_STATUS: LeadStatus[]
//   ) {
//     return JSON.stringify(
//       this.toJson(GLOBAL_STATUS, CALL_CENTER_STATUS, SHIPPING_STATUS)
//     );
//   }

//   static toJson(
//     GLOBAL_STATUS: LeadStatus[],
//     CALL_CENTER_STATUS: LeadStatus[],
//     SHIPPING_STATUS: LeadStatus[]
//   ) {
//     return {
//       GLOBAL_STATUS: GLOBAL_STATUS,
//       CALL_CENTER_STATUS: CALL_CENTER_STATUS,
//       SHIPPING_STATUS: SHIPPING_STATUS,
//     };
//   }

//   static unserialze(data: string): {
//     GLOBAL_STATUS: LeadStatus[];
//     CALL_CENTER_STATUS: LeadStatus[];
//     SHIPPING_STATUS: LeadStatus[];
//   } {
//     var parse = JSON.parse(data);
//     return {
//       GLOBAL_STATUS: parse.GLOBAL_STATUS,
//       CALL_CENTER_STATUS: parse.CALL_CENTER_STATUS,
//       SHIPPING_STATUS: parse.SHIPPING_STATUS,
//     };
//   }
// }

// class Lead {
//   private currentStatus: LEAD_STATUS | null = null;
//   private statusTime: string = "";
//   private GLOBAL_STATUS: LeadStatus[] = [];
//   private CALL_CENTER_STATUS: LeadStatus[] = [];
//   private SHIPPING_STATUS: LeadStatus[] = [];

//   private constructor() {}

//   static create() {
//     const lead = new Lead();
//     lead.updateSystemStatus({
//       current: LEAD_STATUS.FRESH,
//       note: "FRESHLY CREATED LEAD",
//     });
//     return lead;
//   }

//   toRow() {
//     return [
//       this.currentStatus,
//       this.statusTime,
//       LeadStatusManager.serialze(
//         this.GLOBAL_STATUS,
//         this.CALL_CENTER_STATUS,
//         this.SHIPPING_STATUS
//       ),
//     ];
//   }

//   static fromRow(rawData: string[]) {
//     const { CALL_CENTER_STATUS, GLOBAL_STATUS, SHIPPING_STATUS } =
//       LeadStatusManager.unserialze(rawData[2]);
//     const lead = new Lead();

//     lead.GLOBAL_STATUS = GLOBAL_STATUS;
//     lead.CALL_CENTER_STATUS = CALL_CENTER_STATUS;
//     lead.SHIPPING_STATUS = SHIPPING_STATUS;

//     lead.currentStatus = rawData[0] as LEAD_STATUS;
//     lead.statusTime = rawData[1];
//     return lead;
//   }

//   updateSystemStatus(Status: Omit<LeadStatus, "prev" | "date">) {
//     this.GLOBAL_STATUS.unshift({
//       prev: this.GLOBAL_STATUS[0]?.current || null,
//       current: Status.current,
//       date: "2024-11-13T11:04:21.366Z",
//       note: Status.note,
//     });
//     this.updateCurrentStatus();
//   }

//   updateBulkShippingStatus(Status: LeadStatus[]) {
//     // The receive status should be sorted from new to old
//     this.SHIPPING_STATUS = Status;
//     this.updateCurrentStatus();
//   }

//   updateBulkCallCenterStatus(Status: LeadStatus[]) {
//     // The receive status should be sorted from new to old
//     this.SHIPPING_STATUS = Status;
//     this.updateCurrentStatus();
//   }

//   updateCurrentStatus() {
//     var latestStatus = [
//       this.GLOBAL_STATUS[0],
//       this.CALL_CENTER_STATUS[0],
//       this.SHIPPING_STATUS[0],
//     ];

//     latestStatus.sort((s1, s2) => {
//       return -(new Date(s1.date).getTime() - new Date(s2.date).getTime());
//     });
//     this.currentStatus = latestStatus[0].current;
//     this.statusTime = latestStatus[0].date;
//   }

//   save() {
//     //save the current state
//     console.log(this.toRow());
//   }
// }

// function main() {
//   const lead = Lead.create();
//   lead.updateSystemStatus({
//     current: LEAD_STATUS.VALIDE,
//     note: "",
//   });
//   lead.updateSystemStatus({
//     current: LEAD_STATUS.SENT,
//     note: "",
//   });
//   lead.updateBulkCallCenterStatus([
//     {
//       prev: null,
//       current: LEAD_STATUS.PENDING,
//       date: "2024-11-20T11:04:21.366Z",
//       note: "SENT TO CLIENT WAITING",
//     },
//   ]);

//   lead.updateBulkCallCenterStatus([
//     {
//       prev: LEAD_STATUS.PENDING,
//       current: LEAD_STATUS.PENDING,
//       date: "2024-11-21T11:04:21.366Z",
//       note: "SENT TO CLIENT WAITING",
//     },
//     {
//       prev: null,
//       current: LEAD_STATUS.PENDING,
//       date: "2024-11-20T11:04:21.366Z",
//       note: "SENT TO CLIENT WAITING",
//     },
//   ]);


//   lead.updateBulkShippingStatus([
//     {
//       prev: null,
//       current: LEAD_STATUS.SHIPPED,
//       date: "2024-11-25T11:04:21.366Z",
//       note: "SENT TO CLIENT WAITING",
//     },
//   ]);


//   console.log(lead.toRow());
// }

// main();
