import { SP } from "../../Global";

class FB_ADS_SECRETS {
  static readonly KEY = "FACEBOOK_ADS_SECRETS";

  static getSecrets(): string[] {
    return SP.getProperty(this.KEY)?.split("|") || [];
  }
}

export default FB_ADS_SECRETS;
