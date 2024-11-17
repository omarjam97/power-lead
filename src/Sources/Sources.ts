import Leads from "../Entities/Leads";
import Woocommerce from "./adapters/Woocommerce";

export enum SourceTypes {
  WEBHOOK = "WEBHOOK",
}

export enum EnumSources {
  WOOCOMMERCE = "WOOCOMMERCE",
}

export interface Source {
  type: SourceTypes;
  execute(rawData: string, storeName: string): Promise<Leads | null>; // Add storeName parameter
}

class Sources {
  static POST: Record<EnumSources, Source> = {
    [EnumSources.WOOCOMMERCE]: new Woocommerce(),
  };

  static getSource(source: EnumSources): Source {
    return Sources.POST[source];
  }
}

export default Sources;
