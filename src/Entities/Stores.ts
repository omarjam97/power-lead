import { SS } from "../Global";

class Stores {
  public Index: number | null = null; // Add Index property
  public Name: string;

  static sheetName: string = "STORES_TABLE";
  static header: string[] = ["Index", "Name"];

  private constructor(options: { Index: number | null; Name: string }) {
    this.Index = options.Index;
    this.Name = options.Name;
  }

  static getSheet() {
    return SS.getSheetByName(
      Stores.sheetName
    ) as GoogleAppsScript.Spreadsheet.Sheet;
  }

  static create(name: string) {
    return new Stores({
      Index: null,
      Name: name,
    });
  }

  static fromRow(data: any[]): Stores {
    // Add type annotation
    return new Stores({
      Index: data[0],
      Name: data[1],
    });
  }

  toRow(): any[] {
    // Add type annotation
    return [this.Index, this.Name];
  }

  save(): boolean {
    // Returns true if successful, false otherwise
    const ss = Stores.getSheet();
    let nameExists = false;

    if (!this.Index) {
      // Only check for existing name when creating a new store
      const lastRow = ss.getLastRow();
      if (lastRow != 1) {
        const data = ss
          .getRange(2, 1, lastRow - 1, Stores.header.length)
          .getValues();

        nameExists = data.some((row) => row[1] == this.Name);
      }
    }

    if (nameExists) {
      Logger.log(`Store with name "${this.Name}" already exists.`);
      return false; // Indicate failure (duplicate name)
    }

    if (this.Index) {
      // Update existing store
      try {
        ss.getRange(this.Index, 1, 1, this.toRow().length).setValues([
          this.toRow(),
        ]);
        return true;
      } catch (error) {
        Logger.log(`Error updating store at index ${this.Index}: ${error}`);
        return false;
      }
    } else {
      // Create new store
      try {
        this.Index = ss.getLastRow() + 1;
        ss.appendRow(this.toRow());
        return true;
      } catch (error) {
        Logger.log(`Error creating new store: ${error}`);
        return false;
      }
    }
  }

  static getAll(): Stores[] {
    const ss = Stores.getSheet();
    const lastRow = ss.getLastRow();

    if (lastRow <= 1) {
      // Handle empty data range
      return [];
    }
    const data = ss
      .getRange(2, 1, lastRow - 1, Stores.header.length)
      .getValues();
    return data.map((row) => new Stores({ Index: row[0], Name: row[1] }));
  }
}

function StoresMenu() {
  SpreadsheetApp.getUi().createMenu('Stores')
    .addItem('Add Store', 'showAddStoreForm')
    .addToUi();
}

function showAddStoreForm() {
  const html = HtmlService.createTemplateFromFile('HTML/Stores/addStoreForm')
    .evaluate()
    .setWidth(400)
    .setHeight(300);  // Adjust height as needed
  SpreadsheetApp.getUi().showModalDialog(html, 'Add Store');
}

function createStore(name: string): { success: boolean; message: string } {
  try {
      // Check if a store with this name already exists.  The Stores.save() method already handles this.
      const store = Stores.create(name);
      if (store && store.save()) {
          return { success: true, message: "Store created successfully!" };
      } else {
          return { success: false, message: `Store with name "${name}" already exists.`}; // Or a more generic message.
      }
  } catch (error) {
      Logger.log("Error creating store: " + error);
      return { success: false, message: "An unexpected error occurred." };
  }
}
export default Stores;

export {
  StoresMenu
}