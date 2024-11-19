import { SS } from "../../Global";
import { AdAccount, BM, fb_spend } from "../../Types/FB_ADS";
import FB_ADS_SECRETS from "./FB_ADS_SECRETS";
import FB_API from "./FB_API";

class FB_ADS_METRICS_PRE {
  static context = "FB_ADS_METRICS_PRE";
  //SHEET NAME
  static sheetName: string = "FB_ADS_METRICS_PRE";
  static header: string[] = [
    "DATE",
    "PORTFOLIO",
    "AD ACCOOUNT",
    "PROCESSED",
    "BATCHES",
  ];

  //Sheet
  static getSheet() {
    return SS.getSheetByName(
      FB_ADS_METRICS_PRE.sheetName
    ) as GoogleAppsScript.Spreadsheet.Sheet;
  }

  static BATCH_SIZE = 30000; // Adjust as needed

  static getDailySpend() {
    const secrets = FB_ADS_SECRETS.getSecrets();
    const now = new Date();
    const y = new Date();
    y.setDate(now.getDate() - 1);
    const yesterday =  Utilities.formatDate(y, "UTC", "YYYY-MM-dd");

    for (let i = 0; i < secrets.length; i++) {
      const bms = FB_API.getBMs(secrets[i]);
      for (let j = 0; j < bms.length; j++) {
        // Fix: j was incrementing i
        const Ad_Accounts = FB_API.getACCs(bms[j].id, secrets[i]);

        for (let w = 0; w < Ad_Accounts.length; w++) {
          // Simplified timezone check:
          const accountHour =
            (now.getUTCHours() + Ad_Accounts[w].timezone_offset_hours_utc + 24) % 24;
          if (accountHour !== 1) continue; // Skip if it's not 1 AM in ad account timezone

          const spend = FB_API.getSpendByCountry(
            Ad_Accounts[w].account_id,
            secrets[i],
            yesterday
          );
          if(!spend.length) continue;//no spend for ad account

          const dataToBatch = {
            Portfolio: `${secrets[i].substring(0, 10)}_${secrets[i].substring(
              0,
              10
            )}`, // Consider improving this
            bm: bms[j],
            adAccount: Ad_Accounts[w],
            spend: spend,
            start_date: yesterday,
            end_date: yesterday,
          };

          const batches = this.generateBatches(JSON.stringify(dataToBatch));

          // Store each batch in a separate cell:
          const rowData = [
            yesterday,
            dataToBatch.Portfolio,
            Ad_Accounts[w].name,
            false,
            ...batches, // Spread the batches into the row data
          ];

          this.getSheet().appendRow(rowData);
        }
      }
    }
  }

  static generateBatches(data: string): string[] {
    const batches: string[] = [];
    if (data.length <= this.BATCH_SIZE) {
      return [data];
    }

    for (let i = 0; i < data.length; i += this.BATCH_SIZE) {
      batches.push(data.substring(i, i + this.BATCH_SIZE));
    }
    return batches;
  }

  static reconstructBatches(row: any[]): {
    start_date: string;
    end_date: string;
    Portfolio: string;
    bm: BM;
    adAccount: AdAccount;
    spend: fb_spend[];
  } {
    // Start from the 5th column (index 4) to collect batches
    const batchStrings = row.slice(4).filter((batch) => batch !== ""); // Filter out empty cells
    const combinedData = batchStrings.join("");
    return JSON.parse(combinedData);
  }

  static getUnprocessedRows() {
    const sheet = this.getSheet();
    const data = sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues(); // Get all data except header
    return data.filter((row) => row[3] === false); // Filter for rows where "PROCESSED" is false
  }

  static markRowProcessed(rowNumber: number) {
    // Row number starting from 1 (header is row 1)
    const sheet = this.getSheet();
    sheet.getRange(rowNumber, 4).setValue(true); // Set "PROCESSED" column to true
  }
}

function test() {
  // const secrets = FB_ADS_SECRETS.getSecrets();
  // const now = new Date();
  // const y = new Date();
  // y.setDate(now.getDate() - 1);
  // const yesterday =  Utilities.formatDate(y, "UTC", "YYYY-MM-dd");

  // for (let i = 0; i < secrets.length; i++) {
  //   const bms = FB_API.getBMs(secrets[i]);
  //   Logger.log(JSON.stringify(bms));
  //   for (let j = 0; j < bms.length; j++) {
  //       // Fix: j was incrementing i
  //       const Ad_Accounts = FB_API.getACCs(bms[j].id, secrets[i]);
        
  //       for (let w = 0; w < Ad_Accounts.length; w++) {
  //           // Simplified timezone check:
  //           Logger.log(JSON.stringify(Ad_Accounts[w]));
  //           const accountHour =
  //             (7 + Ad_Accounts[w].timezone_offset_hours_utc + 24) % 24;
  //           if (accountHour !== 1) continue; // Skip if it's not 1 AM in ad account timezone
  //           Logger.log("TIME TO PROCESS");


  //           const spend = FB_API.getSpendByCountry(
  //             Ad_Accounts[w].account_id,
  //             secrets[i],
  //             yesterday
  //           );

  //           if(!spend.length) continue;//no spend for ad account

  //           const dataToBatch = {
  //               Portfolio: `${secrets[i].substring(0, 10)}_${secrets[i].substring(
  //                 0,
  //                 10
  //               )}`, // Consider improving this
  //               bm: bms[j],
  //               adAccount: Ad_Accounts[w],
  //               spend: spend,
  //               start_date: yesterday,
  //               end_date: yesterday,
  //             };
    
  //             const batches = FB_ADS_METRICS_PRE.generateBatches(JSON.stringify(dataToBatch));
    
  //             // Store each batch in a separate cell:
  //             const rowData = [
  //               yesterday,
  //               dataToBatch.Portfolio,
  //               Ad_Accounts[w].name,
  //               false,
  //               ...batches, // Spread the batches into the row data 
  //             ];
    
  //             FB_ADS_METRICS_PRE.getSheet().appendRow(rowData);
  //       }
  //   }
  // }
}

export default FB_ADS_METRICS_PRE;
