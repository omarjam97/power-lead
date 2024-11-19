import StoreProducts from "../../Entities/Products/StoreProducts";
import { SS } from "../../Global";
import FB_ADS_METRICS_PRE from "./FB_ADS_METRICS_PRE";

class FB_ADS_METRICS {
  static context = "FB_ADS_METRICS";
  //SHEET NAME
  static sheetName: string = "FB_ADS_METRICS";

  static header: string[] = [
    "Portfolio",
    "bmId",
    "bmName",
    "AdAccountId",
    "AdAccountName",
    "compaignName",
    "compaignId",
    "adsetName",
    "adsetId",
    "adName",
    "adId",
    "store",
    "productID",
    "country",
    "spend",
    "results",
    "cost",
    "objective",
    "start_date",
    "end_date",
  ];

  //Shett
  static getSheet() {
    return SS.getSheetByName(
      FB_ADS_METRICS.sheetName
    ) as GoogleAppsScript.Spreadsheet.Sheet;
  }

  static processBatches() {
    const processedData: any[][] = []; // Array to store processed data for bulk append

    //detect product and store
    const ss = StoreProducts.getSheet();
    const lastRow = ss.getLastRow();

    if (lastRow <= 1) return null; // No data in the sheet

    const data = ss
      .getRange(2, 1, lastRow - 1, StoreProducts.header.length)
      .getValues();

    const sheet = FB_ADS_METRICS_PRE.getSheet();
    const pre_process = sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues(); // Get all data except header
    pre_process.forEach((row, index) => {
      if (row[3] == false) {
        try {
          const reconstructedData = FB_ADS_METRICS_PRE.reconstructBatches(row);
          const { end_date, start_date, Portfolio, bm, adAccount, spend } =
            reconstructedData;

          spend.forEach((s) => {
            let store: string | null = null;
            let productStoreId: string | null = null;

            for (const row of data) {
              const token = row[4]; // Token is in the 5th column (index 4)
              if (s.ad_name.includes(token)) {
                store = row[1];
                productStoreId = row[2]; // ProductStoreId is in the 3rd column (index 2)
                break;
              }
            }

            processedData.push([
              Portfolio,
              bm.id,
              bm.name,
              adAccount.id,
              adAccount.name,
              s.campaign_name, // Assuming spend object has campaign_name
              s.campaign_id, // Assuming spend object has campaign_id
              s.adset_name, // ... and so on for other fields
              s.adset_id,
              s.ad_name,
              s.ad_id,
              store, // Or whatever ID you're using
              productStoreId, // Or whatever ID you're using
              s.country,
              s.spend,
              s.results,
              s.cost,
              s.objective,
              start_date, // Use the date from the reconstructed data
              end_date, // Assuming same start and end date based on your previous code
            ]);
          });

          FB_ADS_METRICS_PRE.markRowProcessed(index + 2);
        } catch (error) {
          Logger.log(`Error processing row ${index}: ${error}`);
          // Handle the error appropriately (e.g., log it, skip the row, etc.)
        }
      }
    });

    if (processedData.length > 0) {
      FB_ADS_METRICS.getSheet()
        .getRange(
          FB_ADS_METRICS.getSheet().getLastRow() + 1,
          1,
          processedData.length,
          processedData[0].length
        )
        .setValues(processedData);
    }
  }
  
}

function testProcessBatches() {
  // const processedData: any[][] = []; // Array to store processed data for bulk append
  // //detect product and store
  // const ss = StoreProducts.getSheet();
  // const lastRow = ss.getLastRow();
  // if (lastRow <= 1) return null; // No data in the sheet
  // const data = ss
  //   .getRange(2, 1, lastRow - 1, StoreProducts.header.length)
  //   .getValues();
  // const sheet = FB_ADS_METRICS_PRE.getSheet();
  // const pre_process = sheet
  //   .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
  //   .getValues(); // Get all data except header
  // pre_process.forEach((row, index) => {
  //   if (row[3] == false) {
  //     try {
  //       const reconstructedData = FB_ADS_METRICS_PRE.reconstructBatches(row);
  //       const { end_date, start_date, Portfolio, bm, adAccount, spend } =
  //         reconstructedData;
  //       spend.forEach((s) => {
  //         let store: string | null = null;
  //         let productStoreId: string | null = null;
  //         for (const row of data) {
  //           const token = row[4]; // Token is in the 5th column (index 4)
  //           if (s.ad_name.includes(token)) {
  //             store = row[1];
  //             productStoreId = row[2]; // ProductStoreId is in the 3rd column (index 2)
  //             break;
  //           }
  //         }
  //         processedData.push([
  //           Portfolio,
  //           bm.id,
  //           bm.name,
  //           adAccount.id,
  //           adAccount.name,
  //           s.campaign_name, // Assuming spend object has campaign_name
  //           s.campaign_id, // Assuming spend object has campaign_id
  //           s.adset_name, // ... and so on for other fields
  //           s.adset_id,
  //           s.ad_name,
  //           s.ad_id,
  //           store, // Or whatever ID you're using
  //           productStoreId, // Or whatever ID you're using
  //           s.country,
  //           s.spend,
  //           s.results,
  //           s.cost,
  //           s.objective,
  //           start_date, // Use the date from the reconstructed data
  //           end_date, // Assuming same start and end date based on your previous code
  //         ]);
  //       });
  //       FB_ADS_METRICS_PRE.markRowProcessed(index + 2);
  //     } catch (error) {
  //       Logger.log(`Error processing row ${index}: ${error}`);
  //       // Handle the error appropriately (e.g., log it, skip the row, etc.)
  //     }
  //   }
  // });
  // if (processedData.length > 0) {
  //   FB_ADS_METRICS.getSheet()
  //     .getRange(
  //       FB_ADS_METRICS.getSheet().getLastRow() + 1,
  //       1,
  //       processedData.length,
  //       processedData[0].length
  //     )
  //     .setValues(processedData);
  // }
}

export default FB_ADS_METRICS;
