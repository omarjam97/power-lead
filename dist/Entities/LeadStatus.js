"use strict";
// import Entity from "./Entity";
// import { LeadsStatus } from "../Types/LeadStatus"; // Import your LeadStatus type
// import { SS } from "../Global";
// interface iLeadStatus {
//   Index: number;
//   LeadIndex: number;
//   PrevStatus: LeadsStatus | null;
//   CurrentStatus: LeadsStatus;
//   Note: string | null;
//   Time: string;
// }
// class LeadStatus extends Entity {
//   public Index: number;
//   public LeadIndex: number;
//   public PrevStatus: LeadsStatus | null;
//   public CurrentStatus: LeadsStatus;
//   public Note: string | null;
//   public Time: string;
//   static sheetName: string = "LEADS_STATUS_TABLE";
//   static header: string[] = [
//     "Index",
//     "LeadIndex",
//     "PrevStatus",
//     "CurrentStatus",
//     "Note", // Added Note to the header
//     "Time",
//   ];
//   private constructor(options: {
//     Index: number;
//     LeadIndex: number;
//     PrevStatus: LeadsStatus | null;
//     CurrentStatus: LeadsStatus;
//     Note: string | null;
//     Time: string;
//   }) {
//     super();
//     this.Index = options.Index;
//     this.LeadIndex = options.LeadIndex;
//     this.PrevStatus = options.PrevStatus;
//     this.CurrentStatus = options.CurrentStatus;
//     this.Note = options.Note;
//     this.Time = options.Time;
//   }
//   toRow(): Array<any> {
//     return [
//       this.Index,
//       this.LeadIndex,
//       this.PrevStatus,
//       this.CurrentStatus,
//       this.Note, // Include Note in the row
//       this.Time,
//     ];
//   }
//   static fromRow(data: Array<string>): LeadStatus {
//     return new LeadStatus({
//       Index: parseInt(data[0]),
//       LeadIndex: parseInt(data[1]),
//       PrevStatus: data[2] as LeadsStatus,
//       CurrentStatus: data[3] as LeadsStatus,
//       Note: data[4], // Read Note from row
//       Time: data[5],
//     });
//   }
//   static getSheet() {
//     return SS.getSheetByName(
//       LeadStatus.sheetName
//     ) as GoogleAppsScript.Spreadsheet.Sheet;
//   }
//   // Example create method (adapt as needed)
//   static add(options: {
//     leadIndex: number;
//     prevStatus: LeadsStatus | null;
//     currentStatus: LeadsStatus;
//     time: string;
//     note: string | null;
//   }) {
//     var lock = LockService.getScriptLock();
//     try {
//       if (!lock.tryLock(120000)) {
//         // Attempt to acquire lock with timeout
//         return; // Exit if lock cannot be acquired
//       }
//       const sheet = this.getSheet();
//       const index = sheet.getLastRow() + 1;
//       const leadStatus = new LeadStatus({
//         Index: index,
//         LeadIndex: options.leadIndex,
//         PrevStatus: options.prevStatus,
//         CurrentStatus: options.currentStatus,
//         Note: options.note,
//         Time: options.time,
//       });
//       sheet.appendRow(leadStatus.toRow());
//       return leadStatus; // Return the created LeadStatus object
//     } catch (e) {
//       Logger.log(e); // Log the error for debugging
//     } finally {
//       if (lock.hasLock()) {
//         lock.releaseLock();
//       }
//     }
//     return undefined; // Return undefined if an error occurred or lock couldn't be acquired.
//   }
//   static getLeadStatus(status: string): LeadStatus[] {
//     const sheet = LeadStatus.getSheet();
//     const headerLen = LeadStatus.header.length;
//     return status
//       .split("|")
//       .map((statusIndex) =>
//         LeadStatus.fromRow(
//           sheet.getRange(parseInt(statusIndex), 1, 1,LeadStatus.header.length).getValues()[0]
//         )
//       );
//   }
// }
// export default LeadStatus;
