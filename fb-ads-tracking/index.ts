interface Portfolio {
  id: number;
  secret: string;
  status: boolean;
}

const Portfolios: Portfolio[] = [
  {
    id: 0,
    secret:
      "EAAH0sCi3O0kBOyTZC1ItczLJl48FRYSTL22k27RkwJNA9lWWPkZCOx8L6kjZBZBXU7JWISUJZBBN2f9auZCkt9kSSZC4BoyWRcbpVn51NZCEGJjWI3y9lFK4gy6geSRiceNf7DMQe49esXaRAxhEfZCiA22bgNDWzVZCou49O1sjgNacMgdNClpZCbqZChmNpZAx2REBO",
    status: true,
  },
];

interface fb_tracking {
  compaignName: string;
  compaignId: string;

  adsetName: string;
  adsetId: string;

  adName: string;
  adId: string;

  spend: number;

  results: number;
  result_type: number;

  product: string;
  country: string;

  date: string;
}

async function fetchBusinessManagers(
  accessToken: string
): Promise<{ id: string; name: string }[]> {
  const baseUrl = "https://graph.facebook.com/v21.0";
  const endpoint = `${baseUrl}/me/businesses`;

  try {
    const response = await fetch(`${endpoint}?access_token=${accessToken}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Facebook API Error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching business managers:", error);
    throw error;
  }
}

async function fetchAllAdAccounts(accessToken: string) {
  const baseUrl = "https://graph.facebook.com/v21.0";
  const accounts = [];
  let nextPage = `${baseUrl}/me/adaccounts?fields=name,account_id,account_status&limit=500&access_token=${accessToken}`;

  while (nextPage) {
    try {
      const response = await fetch(nextPage);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Facebook API Error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      accounts.push(...data.data);

      nextPage = data.paging?.next;
    } catch (error) {
      console.error("Error fetching ad accounts:", error);
      throw error;
    }
  }

  return accounts;
}

async function getAdAccountsforBM(bmId: string, accessToken: string) {
  const baseUrl = "https://graph.facebook.com/v21.0";
  const accounts = [];
  let nextPage = `${baseUrl}/${bmId}/owned_ad_accounts?fields=name,account_id,timezone_offset_hours_utc,account_status,timezone_name,timezone_id&limit=500&access_token=${accessToken}`;

  while (nextPage) {
    try {
      const response = await fetch(nextPage);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Facebook API Error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      accounts.push(...data.data);

      nextPage = data.paging?.next;
    } catch (error) {
      console.error("Error fetching ad accounts:", error);
      throw error;
    }
  }

  return accounts;
}

// Separate function for country breakdown
async function fetchAdSpendByCountry(
  accountId: string,
  accessToken: string,
  startDate: string,
  endDate: string
) {
  const baseUrl = "https://graph.facebook.com/v21.0";
  const endpoint = `${baseUrl}/act_${accountId}/insights`;

  const params = new URLSearchParams({
    access_token: accessToken,
    level: "ad",
    status: "active,inactive",
    fields:
      "campaign_id,campaign_name,adset_name,adset_id,ad_name,ad_id,spend,cost_per_action_type,actions,objective,optimization_goal",
    time_range: JSON.stringify({
      since: startDate,
      until: endDate,
    }),
    breakdowns: "country",
    time_increment: "1",
  });

  let nextPage = `${endpoint}?${params.toString()}`;

  const spend = [];

  while (nextPage) {
    try {
      const response = await fetch(nextPage);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Facebook API Error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      data?.data?.forEach((d: any,index : number) => {
        if(d.spend && d?.actions && d?.cost_per_action_type){
            if(d.objective == "OUTCOME_SALES"){
                data.data[index]["results"] = d.actions.find((e:any) => e.action_type == "purchase")?.value || 0
                data.data[index]["cost"] = d.cost_per_action_type.find((e:any) => e.action_type == "purchase")?.value || 0
            }
        }
        const { actions,cost_per_action_type, ...newData } = d;
        data.data[index] = newData;
      });
      spend.push(...data.data);

      nextPage = data.paging?.next;
    } catch (error) {
      console.error("Error fetching ad accounts:", error);
      throw error;
    }
  }
  return spend;
}

async function main() {
  const date = "2024-11-15";
  const data: any = {};

  for (let i = 0; i < Portfolios.length; i++) {
    const portfolio = Portfolios[i];
    data[portfolio.id] = {};

    const businessManagers = await fetchBusinessManagers(portfolio.secret);
    for (let j = 0; j < businessManagers.length; j++) {
      const bm = businessManagers[j];
      data[portfolio.id][bm.id] = {
        name: bm.name,
        adAccounts: await getAdAccountsforBM(bm.id, portfolio.secret),
      };

      const adAccounts = data[portfolio.id][bm.id].adAccounts;
      for (let k = 0; k < adAccounts.length; k++) {
        const adAccount = adAccounts[k];
        adAccounts[k]["spend"] = {};
        const spend = await fetchAdSpendByCountry(
          adAccount.account_id,
          portfolio.secret,
          date,
          date
        );
        adAccounts[k]["spend"] = spend; // Directly modify the adAccounts array
      }
    }
    // Moved the console.log outside the inner loop to print after all spends are fetched for the portfolio
    console.log(JSON.stringify(data, null, 2));
  }
}

main();
