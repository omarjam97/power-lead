import { AdAccount, BM, fb_spend } from "../../Types/FB_ADS";

class FB_API {
  static fetchData(url : string, options : any) {
    // Simplified fetch function without retries (you can add retries if needed)
    const response = UrlFetchApp.fetch(url, {
      ...options,
      muteHttpExceptions: true,
    });
    if (response.getResponseCode() !== 200) {
      throw new Error(
        `Facebook API Error: ${response
          .getContentText()
          .substring(0, 500)} (Status: ${response.getResponseCode()})`
      );
    }
    return JSON.parse(response.getContentText());
  }

  static getBMs(secret: string): BM[] {
    const baseUrl = "https://graph.facebook.com/v21.0";
    const endpoint = `${baseUrl}/me/businesses`;
    const url = `${endpoint}?access_token=${secret}`;
    const options = { 'method': 'get' };
    const data = this.fetchData(url, options).data;
    return data;
  }

  static getACCs(bmId: string, secret: string): AdAccount[] {
    const baseUrl = "https://graph.facebook.com/v21.0";
    const accounts : any[] = [];
    let nextPage = `${baseUrl}/${bmId}/owned_ad_accounts?fields=name,account_id,account_status,timezone_offset_hours_utc,timezone_name,timezone_id&limit=500&access_token=${secret}`;
    while (nextPage) {
      const data = this.fetchData(nextPage, { 'method': 'get' });
      accounts.push(...data.data);
      nextPage = data.paging?.next;
    }
    return accounts;
  }
  
  static getSpendByCountry(
    accId: string,
    secret: string,
    start: string,
    end?: string
  ): fb_spend[] {
    const baseUrl = "https://graph.facebook.com/v21.0";
    const endpoint = `${baseUrl}/act_${accId}/insights`;
    const params = {
      access_token: secret,
      level: "ad",
      status: "active,inactive",
      fields: "campaign_id,campaign_name,adset_name,adset_id,ad_name,ad_id,spend,cost_per_action_type,actions,objective,optimization_goal",
      time_range: JSON.stringify({ since: start, until: end || start }),
      breakdowns: "country",
      time_increment: "1",
    };
    const url = `${endpoint}?${Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')}`;
    const spend : fb_spend[]  = [];
    let nextPage = url;
    while (nextPage) {
      const data = this.fetchData(nextPage, { 'method': 'get' });
  
      data?.data?.forEach((d, index) => {
        if (d.spend && d?.actions && d?.cost_per_action_type) {
          if (d.objective == "OUTCOME_SALES") {
            data.data[index]["results"] = d.actions.find((e) => e.action_type == "purchase")?.value || 0
            data.data[index]["cost"] = d.cost_per_action_type.find((e) => e.action_type == "purchase")?.value || 0
          }
          if (d.objective == "OUTCOME_LEADS") {
            data.data[index]["results"] = d.actions.find((e) => e.action_type == "lead")?.value || 0
            data.data[index]["cost"] = d.cost_per_action_type.find((e) => e.action_type == "lead")?.value || 0
          }
        }
        const { actions, cost_per_action_type, ...newData } = d;
        data.data[index] = newData;
      });
      spend.push(...data.data);
      nextPage = data.paging?.next;
    }
    return spend;
  }

}
export default FB_API;
