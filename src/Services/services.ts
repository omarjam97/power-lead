import Leads from "../Entities/Leads";
import ProductInfo from "../Entities/Products/ProductInfo";
import { SS } from "../Global";
import AVLeadStatus from "../Types/LeadStatus";
import COD_IN_AFRICA_SERVICE from "./adapters/COD_IN_AFRICA";
import currentServices from "./currentServices";

export interface service {
  trackOrder(Lead: Leads): Leads | void;
  processOrder(Lead: Leads): Leads | void;
  trackStock(productInfo: ProductInfo[]): boolean;
  getDefaultMetaData(): string;
}

export default class Services {
  static readonly current: Record<currentServices, service> = {
    [currentServices.COD_IN_AFRICA]: new COD_IN_AFRICA_SERVICE(),
  };

  private Index: number | null = null; // Allow null for new services
  private Name: string;

  static sheetName: string = "SERVICES_TABLE";

  static header: string[] = ["Index", "Name"];

  constructor(options: { Index: number | null; Name: currentServices }) {
    // Use currentServices type for Name
    this.Index = options.Index;
    this.Name = options.Name;
  }

  toRow(): Array<any> {
    return [this.Index, this.Name];
  }

  fromRow(data: Array<string>): Services {
    // Specify return type
    return new Services({
      Index: parseInt(data[0]), // Parse index as number
      Name: data[1] as currentServices, // Cast to currentServices type
    });
  }

  static getSheet() {
    return SS.getSheetByName(
      Services.sheetName
    ) as GoogleAppsScript.Spreadsheet.Sheet;
  }

  static async add(name: currentServices) {
    // Use currentServices as parameter type
    const ss = Services.getSheet();
    const lastRow = ss.getLastRow();
    if (lastRow != 1) {
      const data = ss
        .getRange(2, 1, lastRow - 1, Services.header.length)
        .getValues();

      const existingService = data.some((row) => row[1] === name);

      if (existingService) {
        Logger.log(`Service "${name}" already exists.`);
        return;
      }
    }

    const newService = new Services({ Index: null, Name: name });
    if (newService.save()) {
      Logger.log(`Service "${name}" added successfully.`);
    }
  }

  save(): boolean {
    // Return boolean indicating success
    const ss = Services.getSheet();

    if (this.Index) {
      // Update
      try {
        ss.getRange(this.Index, 1, 1, this.toRow().length).setValues([
          this.toRow(),
        ]);
        return true;
      } catch (error) {
        Logger.log(`Error updating Service at index ${this.Index}: ${error}`);
        return false;
      }
    } else {
      // Create
      try {
        this.Index = ss.getLastRow() + 1;
        ss.appendRow(this.toRow());
        return true;
      } catch (error) {
        Logger.log(`Error creating new Service : ${error}`);
        return false;
      }
    }
  }

  static setup() {
    const servicesToAdd = Object.getOwnPropertyNames(Services.current);

    Logger.log("Settings SERVICES");

    for (const serviceName of servicesToAdd) {
      Logger.log(JSON.stringify(serviceName));
      Services.add(serviceName as currentServices); // Use this.add to call the static add method
    }
  }
}

function TRACK_STOCKS() {
  // 2. Call processOrder
  Object.getOwnPropertyNames(Services.current).map((service) => {
    Services.current[service].trackStock(
      ProductInfo.getAllByService(currentServices.COD_IN_AFRICA)
    );
  });
}

function TRACK_LEADS() {
  Leads.getByStatus(
    [
      //System

      AVLeadStatus.SENT,

      //CALL CENTER
      AVLeadStatus.PENDING,
      AVLeadStatus.UNREACHED,
      AVLeadStatus.OUTOFSTOCK_CALL_CENTER,
      AVLeadStatus.A_TRANSFERER,
      AVLeadStatus.TO_REMIND,

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
    21600000
  ).map((lead) => {
    if (lead.Service) Services.current[lead.Service].trackOrder(lead);
  });
}

function PROCESS_LEADS() {
  Leads.getByStatus([AVLeadStatus.VALIDE]).map((lead) => {
    if (lead.Service) Services.current[lead.Service].processOrder(lead);
  });
}

function SERVICES_TRIGGERS() {
  ScriptApp.newTrigger("TRACK_STOCKS").timeBased().everyHours(12).create();
  ScriptApp.newTrigger("TRACK_LEADS").timeBased().everyHours(1).create();
  ScriptApp.newTrigger("PROCESS_LEADS").timeBased().everyMinutes(10).create();
}

export { SERVICES_TRIGGERS };
