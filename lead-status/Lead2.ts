// enum LEAD_STATUS_TYPES {
//   GLOBAL = "GLOBAL",
//   CALL_CENTER = "CALL_CENTER",
//   SHIPPING = "SHIPPING",
// }

// enum GLOBAL_STATUS {
//   FRESH = "FRESH",
//   VALIDE = "VALIDE",
//   SENT = "SENT",
//   DEAD = "DEAD",
// }

// enum LEAD_STATUS {
//   FRESH = "FRESH",
//   VALIDE = "VALIDE",
//   SENT = "SENT",
//   DEAD = "DEAD",
//   PENDING = "PENDING",
//   CONFIRMED = "CONFIRMED",
//   SHIPPED = "SHIPPED",
// }

// interface LeadStatus {
//   prev: LEAD_STATUS | null;
//   current: LEAD_STATUS;
//   date: number; // Store dates as timestamps for faster comparisons
//   note: string;
// }

// type StatusMap = {
//   [LEAD_STATUS_TYPES.GLOBAL]: LeadStatus[];
//   [LEAD_STATUS_TYPES.CALL_CENTER]: LeadStatus[];
//   [LEAD_STATUS_TYPES.SHIPPING]: LeadStatus[];
// };

// class Lead {
//   private currentStatus: LEAD_STATUS | null = null;
//   private statusTime: number | null = null; // Store as timestamp
//   private statuses: StatusMap = {
//     [LEAD_STATUS_TYPES.GLOBAL]: [],
//     [LEAD_STATUS_TYPES.CALL_CENTER]: [],
//     [LEAD_STATUS_TYPES.SHIPPING]: [],
//   };

//   private constructor() {}

//   static create() {
//     const lead = new Lead();
//     lead.updateStatus(LEAD_STATUS_TYPES.GLOBAL, {
//       current: LEAD_STATUS.FRESH,
//       note: "FRESHLY CREATED LEAD",
//     });
//     return lead;
//   }

//   toRow() {
//     return [
//       this.currentStatus,
//       this.statusTime ? new Date(this.statusTime).toISOString() : "", // Convert back to ISO string for storage
//       JSON.stringify(this.statuses),
//     ];
//   }

//   static fromRow(rawData: any[]) {
//     const lead = new Lead();
//     lead.statuses = JSON.parse(rawData[2]);
//     lead.currentStatus = rawData[0] as LEAD_STATUS;
//     lead.statusTime = rawData[1] ? new Date(rawData[1]).getTime() : null; // Parse date and store as timestamp
//     return lead;
//   }

//   private updateStatus(
//     type: LEAD_STATUS_TYPES,
//     status: Omit<LeadStatus, "prev" | "date">
//   ) {
//     const now = Date.now(); // Get timestamp only once
//     this.statuses[type].unshift({
//       prev: this.statuses[type][0]?.current || null,
//       current: status.current,
//       date: now,
//       note: status.note,
//     });
//     this.updateCurrentStatus();
//   }

//   updateSystemStatus(status: Omit<LeadStatus, "prev" | "date">) {
//     this.updateStatus(LEAD_STATUS_TYPES.GLOBAL, status);
//   }

//   updateBulkStatus(
//     type: LEAD_STATUS_TYPES.CALL_CENTER | LEAD_STATUS_TYPES.SHIPPING,
//     newStatuses: LeadStatus[]
//   ) {
//     if (this.currentStatus != LEAD_STATUS.DEAD) {
//       this.statuses[type] = newStatuses.map((status) => ({
//         ...status,
//         date: new Date(status.date).getTime(),
//       })); // ensure consistent timestamp format
//       this.updateCurrentStatus();
//     }
//   }

//   private updateCurrentStatus() {
//     let latestStatus: LeadStatus | undefined;
//     for (const type in this.statuses) {
//       const status = this.statuses[type as LEAD_STATUS_TYPES][0];
//       if (status && (!latestStatus || status.date > latestStatus.date)) {
//         latestStatus = status;
//       }
//     }

//     if (latestStatus) {
//       this.currentStatus = latestStatus.current;
//       this.statusTime = latestStatus.date;
//     } else {
//       this.currentStatus = null;
//       this.statusTime = null;
//     }
//   }

//   save() {
//     console.log(this.toRow());
//   }
// }

// // Example usage (similar to your main function, adapted for the refactored code):
// function mainRefactored() {
//   const lead = Lead.create();
//   lead.updateSystemStatus({ current: LEAD_STATUS.VALIDE, note: "" });
//   lead.updateSystemStatus({ current: LEAD_STATUS.SENT, note: "" });
//   lead.updateSystemStatus({
//     current: LEAD_STATUS.DEAD,
//     note: `LEAD DEAD BECAUSE BLA BLA`,
//   });

//   // Note: Dates are now passed as strings, which are later converted to timestamps inside updateBulkStatus
//   lead.updateBulkStatus(LEAD_STATUS_TYPES.CALL_CENTER, [
//     {
//       prev: null,
//       current: LEAD_STATUS.PENDING,
//       date: new Date("2024-11-21T11:04:21.366Z").getTime(),
//       note: "SENT TO CLIENT WAITING",
//     },
//   ]);
//   lead.updateBulkStatus(LEAD_STATUS_TYPES.SHIPPING, [
//     {
//       prev: null,
//       current: LEAD_STATUS.SHIPPED,
//       date: new Date("2024-11-25T11:04:21.366Z").getTime(),
//       note: "SENT TO CLIENT WAITING",
//     },
//   ]);
//   lead.save();

//   const [currentStatus, statusTime, serializedStatuses] = lead.toRow();
//   const restoredLead = Lead.fromRow([
//     currentStatus,
//     statusTime,
//     serializedStatuses,
//   ]);
//   console.log(restoredLead.toRow()); // Verify data integrity after serialization and deserialization
// }

// mainRefactored();
