import Countries from "../Config/countries";
import { SS } from "../Global";
import currentServices from "../Services/currentServices";
import Services from "../Services/services";
import AVLeadStatus, {
  LEAD_STATUS_TYPES,
  LeadsStatus,
  LeadStatus,
  StatusMap,
} from "../Types/LeadStatus";
import Cart from "./Cart";
import Client from "./Client";
import Entity from "./Entity";
import GLogger from "../Monitor/GLogger";
import StoreProducts from "./Products/StoreProducts";
import ProductInfo from "./Products/ProductInfo";

class Leads extends Entity {
  static context = "LEAD_SERVICE";
  //SHEET NAME
  static sheetName: string = "LEADS_TABLE";

  //FIELDS
  public ID: string;
  public Index: number | null;
  public Store: string;
  public Source: string;
  public Client: Client;
  public Country: string;
  public PaymentMethod: string;
  public Cart: Cart;
  public ProductStoreID: string | null;
  public ProductID: string | null;
  public Total: number;
  public Currency: string;
  public Service: currentServices | null = null;
  public ServiceMetaData: string | null = null;
  public Attemps: number;
  public CreatedAt: number;
  public currentStatus: LeadsStatus | null = null;
  public statusTime: number | null = null; // Store as timestamp
  public statuses: StatusMap = {
    [LEAD_STATUS_TYPES.GLOBAL]: [],
    [LEAD_STATUS_TYPES.CALL_CENTER]: [],
    [LEAD_STATUS_TYPES.SHIPPING]: [],
  };

  static header: string[] = [
    "ID",
    "Index",
    "Store",
    "Source",
    "ClientInfo",
    "Country",
    "PaymentMethod",
    "Cart",
    "ProductStoreID",
    "ProductID",
    "Total",
    "Currency",
    "Service",
    "ServiceMetaData",
    "CurrentStatus",
    "StatusChangedAt",
    "Statuses",
    "Attemps",
    "CreatedAt",
  ];

  private constructor(options: {
    ID: string;
    Index: number | null;
    Store: string;
    Source: string;
    Client: Client;
    Country: string;
    PaymentMethod: string;
    Cart: Cart;
    ProductStoreID: string | null;
    ProductID: string | null;
    Total: number;
    Currency: string;
    Service: currentServices | null;
    ServiceMetaData: string | null;
    Attemps: number;
    CreatedAt: number;
  }) {
    super();
    this.ID = options.ID;
    this.Index = options.Index;
    this.Store = options.Store;
    this.Source = options.Source;
    this.Client = options.Client;
    this.Country = options.Country;
    this.PaymentMethod = options.PaymentMethod;
    this.Cart = options.Cart;
    this.ProductID = options.ProductID;
    this.ProductStoreID = options.ProductStoreID;
    this.Total = options.Total;
    this.Currency = options.Currency;
    this.Service = options.Service;
    this.ServiceMetaData = options.ServiceMetaData;
    this.Attemps = options.Attemps;
    this.CreatedAt = options.CreatedAt;
  }

  //Serialization

  toRow(): Array<any> {
    return [
      this.ID,
      this.Index,
      this.Store,
      this.Source,
      this.Client.serialize(),
      this.Country,
      this.PaymentMethod,
      this.Cart.serialize(),
      this.ProductStoreID,
      this.ProductID,
      this.Total,
      this.Currency,
      this.Service,
      this.ServiceMetaData,
      this.currentStatus,
      this.statusTime ? this.statusTime.toString() : "",
      JSON.stringify(this.statuses),
      this.Attemps.toString(),
      this.CreatedAt.toString(),
    ];
  }

  static fromRow(data: Array<string>): Leads {
    const lead = new Leads({
      ID: data[0],
      Index: parseInt(data[1]),
      Store: data[2],
      Source: data[3],
      Client: Client.unserialize(data[4]),
      Country: data[5],
      PaymentMethod: data[6],
      Cart: Cart.unserialize(data[7]),
      ProductStoreID: data[8],
      ProductID: data[9],
      Total: parseInt(data[10]),
      Currency: data[11],
      Service: data[12] as currentServices,
      ServiceMetaData: data[13],
      Attemps: parseInt(data[17]),
      CreatedAt: parseInt(data[18]),
    });
    lead.currentStatus = data[14] as LeadsStatus;
    lead.statusTime = parseInt(data[15]); // Parse date and store as timestamp
    lead.statuses = JSON.parse(data[16]);
    return lead;
  }

  //Shett
  static getSheet() {
    return SS.getSheetByName(
      Leads.sheetName
    ) as GoogleAppsScript.Spreadsheet.Sheet;
  }

  //Business Logic
  addAttempt() {
    this.Attemps++;
  }

  //CRUD
  static create(options: {
    ID: string;
    Store: string;
    Source: string;
    Client: Client;
    Country: string;
    PaymentMethod: string;
    Cart: Cart;
    Total: number;
    Currency: string;
    Date: number;
  }) {
    var lock = LockService.getScriptLock();
    try {
      if (!lock.tryLock(120000)) {
        GLogger.critical({
          Context: Leads.context,
          Info: "Unable to get lock after 2 minutes of waiting requires imidiate check LEAD:CREATE",
        });
        return; // Important: Exit to avoid further execution within try block
      }

      var sheet = this.getSheet();
      var leadIndex = sheet.getLastRow() + 1;

      const lead = new Leads({
        ID: options.ID,
        Index: leadIndex,
        Store: options.Store,
        Source: options.Source,
        Client: options.Client,
        Country: options.Country,
        PaymentMethod: options.PaymentMethod,
        Cart: options.Cart,
        Total: options.Total,
        Currency: options.Currency,
        Service: null,
        ServiceMetaData: null,
        Attemps: 0,
        CreatedAt: options.Date,
        ProductID: null,
        ProductStoreID: null,
      });

      sheet.appendRow(lead.toRow());

      lead.updateStatus(LEAD_STATUS_TYPES.GLOBAL, {
        current: AVLeadStatus.FRESH,
        note: `FRESH From ${options.Source}`,
      });

      return lead;
    } catch (e) {
      GLogger.critical({
        Context: Leads.context,
        Info: `Unknown Error Accured While trying creating a lead ${JSON.stringify(
          e
        )}`,
      });
    } finally {
      if (lock.hasLock()) {
        // Release the lock only if it was acquired
        lock.releaseLock();
      }
    }
  }

  private save(status: boolean = false) {
    if (this.Index) {
      var lock = LockService.getScriptLock();
      try {
        if (!lock.tryLock(120000)) {
          GLogger.critical({
            Context: Leads.context,
            Info: "Unable to get lock after 2 minutes of waiting requires imidiate check  LEAD:SAVE",
          });
          return; // Exit if lock cannot be acquired
        }

        var sheet = Leads.getSheet();
        var row = sheet
          .getRange(this.Index, 1, 1, sheet.getLastColumn())
          .getValues()[0];
        if (!row) {
          GLogger.critical({
            Context: Leads.context,
            Info: `Row Not found require check ${
              this.Index
            } create action should only be authorized using the create function | ${JSON.stringify(
              this.toRow()
            )}`,
          });
          return;
        }

        let existingLead = Leads.fromRow(row);

        // Only update these fields if they haven't been set yet
        if (!existingLead.Service) {
          existingLead.Service = this.Service;
        }

        if(!existingLead.ProductID && !existingLead.ProductStoreID){
          existingLead.ProductID = this.ProductID;
          existingLead.ProductStoreID = this.ProductStoreID;
        }
        if (this.ServiceMetaData) {
          existingLead.ServiceMetaData = this.ServiceMetaData;
        }

        //check for status update
        if (status) {
          existingLead.currentStatus = this.currentStatus;
          existingLead.statusTime = this.statusTime;
          existingLead.statuses = this.statuses;
        }

        

        sheet
          .getRange(this.Index, 1, 1, existingLead.toRow().length)
          .setValues([existingLead.toRow()]);
      } catch (e) {
        GLogger.critical({
          Context: Leads.context,
          Info: `Unknown Error Accured While trying to saving a lead ${JSON.stringify(
            e
          )}`,
        });
      } finally {
        if (lock.hasLock()) {
          lock.releaseLock();
        }
      }
    } else {
      Logger.log("Error: Cannot save lead without an index."); // Or throw an error if you prefer.
      GLogger.critical({
        Context: Leads.context,
        Info: `rror: Cannot save lead without an index. please make sure that all the functions are using the save method correctly`,
      });
    }
  }

  //Status Update Logic
  private updateStatus(
    type: LEAD_STATUS_TYPES,
    status: Omit<LeadStatus, "prev" | "date">
  ) {
    try {
      const now = Date.now();
      this.statuses[type].unshift({
        prev: this.statuses[type][0]?.current || null,
        current: status.current,
        date: now,
        note: status.note,
      });
      this.updateCurrentStatus();
    } catch (e) {
      GLogger.critical({
        Context: Leads.context, // Assuming Leads.context is available
        Info: `Unknown Error Occurred in function "updateStatus" ${JSON.stringify(
          e
        )}`,
      });
    }
  }

  private updateCurrentStatus() {
    try {
      let latestStatus: LeadStatus | undefined;
      for (const type in this.statuses) {
        const status = this.statuses[type as LEAD_STATUS_TYPES][0];
        if (status && (!latestStatus || status.date > latestStatus.date)) {
          latestStatus = status;
        }
      }

      if (latestStatus) {
        this.currentStatus = latestStatus.current;
        this.statusTime = latestStatus.date;
      } else {
        this.currentStatus = null;
        this.statusTime = null;
      }
      this.save(true);
    } catch (e) {
      GLogger.critical({
        Context: Leads.context, // Assuming Leads.context is available
        Info: `Unknown Error Occurred in function "updateCurrentStatus" ${JSON.stringify(
          e
        )}`,
      });
      // Consider additional error handling here, e.g.,
      // revert changes, set default values, etc., depending on your application's needs.
    }
  }

  updateSystemStatus(status: Omit<LeadStatus, "prev" | "date">) {
    try {
      this.updateStatus(LEAD_STATUS_TYPES.GLOBAL, status);
    } catch (e) {
      GLogger.critical({
        Context: Leads.context,
        Info: `Unknown Error Occurred in function "updateSystemStatus" ${JSON.stringify(
          e
        )}`,
      });
      // Consider if you need more robust error handling here (e.g., return a value, re-throw)
    }
  }

  updateBulkStatus(
    type: LEAD_STATUS_TYPES.CALL_CENTER | LEAD_STATUS_TYPES.SHIPPING,
    newStatuses: LeadStatus[]
  ) {
    try {
      if (this.currentStatus != AVLeadStatus.DEAD) {
        this.statuses[type] = newStatuses.map((status) => ({
          ...status,
          date: new Date(status.date).getTime(),
        })); // ensure consistent timestamp format
        this.updateCurrentStatus();
      }
    } catch (e) {
      GLogger.critical({
        Context: Leads.context,
        Info: `Unknown Error Occurred in function "updateBulkStatus" ${JSON.stringify(
          e
        )}`,
      });
    }
  }
  //Filter and get

  static getByStatus(
    statuses: LeadsStatus[],
    checkInterval: number = 0
  ): Leads[] {
    try {
      const ss = Leads.getSheet();
      const lastRow = ss.getLastRow();
      Logger.log(Leads.header.length);
      Logger.log(lastRow - 1);
      if (!(lastRow - 1)) {
        return [];
      }
      const data = ss
        .getRange(2, 1, lastRow - 1, Leads.header.length)
        .getValues();

      const statusColumnIndex = Leads.header.indexOf("CurrentStatus");
      const statusChangedAtColumnIndex =
        Leads.header.indexOf("StatusChangedAt");
      const now = new Date().getTime();
      const matchingLeads = data
        .filter((row) => {
          return (
            (checkInterval == 0 ||
              now - parseInt(row[statusChangedAtColumnIndex]) >
                checkInterval) &&
            statuses.includes(row[statusColumnIndex])
          );
        })
        .map(Leads.fromRow); //Only create Lead objects after filtering

      return matchingLeads;
    } catch (e) {
      GLogger.critical({
        Context: Leads.context,
        Info: `Unknown Error Occurred in function "getByStatus" ${JSON.stringify(
          e
        )}`,
      });
      return []; // Return an empty array to handle the error gracefully.  You might want to consider other error handling approaches depending on your application's needs.
    }
  }

  //Triggers
  validate() {
    try {
      if (this.currentStatus != AVLeadStatus.FRESH) {
        GLogger.warning({
          Context: Leads.context,
          Info: `Please Make Sure that you are using this Validate Function With Combination With getByStatus and making sure that the only status filtered by is FRESH | LEAD:validate`,
        });
      }

      let service: currentServices | null = null;
      const  productInfos : Array<ProductInfo> = [];
      this.Cart.products.forEach((product) => {
        const productInfo = StoreProducts.getProduct(
          this.Store,
          product.productId,
          this.Country as Countries
        );

        if (!productInfo || productInfo?.length < 1) {
          this.updateSystemStatus({
            current: AVLeadStatus.DEAD,
            note: `combo not found ${this.Store} ${product.productId} ${this.Country}`,
          });
          throw new Error("");
        }

        if (productInfo[0].TEST_MODE) {
          this.updateSystemStatus({
            current: AVLeadStatus.TEST,
            note: `Product ${product.productId} in country ${this.Country} is in test mode`,
          });
          throw new Error("");
        }

        if (!productInfo[0].ACTIVE) {
          this.updateSystemStatus({
            current: AVLeadStatus.PRODUCT_DISABLED,
            note: `Product ${product.productId} in country ${this.Country} is in disabled`,
          });
          throw new Error("");
        }

        if (!service) {
          service = productInfo[0].Service;
        } else if (service != productInfo[0].Service) {
          this.updateSystemStatus({
            current: AVLeadStatus.DEAD,
            note: `Please make sure that all products in cart are from the same service`,
          });

          throw new Error("");
        }

        productInfos.push(productInfo[0])
      });

      if (!service || !(service in currentServices)) {
        this.updateSystemStatus({
          current: AVLeadStatus.DEAD,
          note: `Service NOT found for order ${this.Index} | ${this.ID} | ${this.Store}`,
        });
        throw new Error("");
      }

      this.updateSystemStatus({
        current: AVLeadStatus.VALIDE,
        note: "",
      });
      this.Service = service as currentServices;
      this.ServiceMetaData =
        Services.current[service as currentServices].getDefaultMetaData();
      this.ProductStoreID = this.Cart.products[0].productId;
      this.ProductID = productInfos[0].PRODUCT_ID;
      this.save();
    } catch (e) {
      if (e?.message != "") {
        GLogger.critical({
          Context: Leads.context,
          Info: `Unknown Error Occurred in function "validate" ${JSON.stringify(
            e
          )}`,
        });
      }
    }
  }
}

function ValidateLeads() {
  try {
    Leads.getByStatus([AVLeadStatus.FRESH]).map((lead) => lead.validate());
  } catch (e) {
    GLogger.critical({
      Context: Leads.context,
      Info: `Unknown Error Occurred in function "ValidateLeads TRIGGER" ${JSON.stringify(
        e
      )}`,
    });
  }
}
function LEADS_TRIGGERS() {
  ScriptApp.newTrigger("ValidateLeads").timeBased().everyMinutes(5).create();
}

export default Leads;
export { LEADS_TRIGGERS };
