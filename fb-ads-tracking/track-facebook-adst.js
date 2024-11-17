async function fetchBusinessManagers(accessToken) {
  const baseUrl = 'https://graph.facebook.com/v21.0';
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
    console.error('Error fetching business managers:', error);
    throw error;
  }
}

async function fetchAllAdAccounts(accessToken) {
  const baseUrl = 'https://graph.facebook.com/v21.0';
  const accounts = [];
  let nextPage = 
    `${baseUrl}/me/adaccounts?fields=name,account_id,account_status&limit=500&access_token=${accessToken}`;

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
      console.error('Error fetching ad accounts:', error);
      throw error;
    }
  }

  return accounts;
}

async function fetchAdSpendByCountryAndHour(
  accountId,
  accessToken,
  startDate,
  endDate
) {
  const baseUrl = 'https://graph.facebook.com/v21.0';
  const endpoint = `${baseUrl}/act_${accountId}/insights`;
  
  const params = new URLSearchParams({
    access_token: accessToken,
    level: 'account',
    fields: 'spend,impressions,clicks',  // Added more metrics
    time_range: JSON.stringify({
      since: startDate,
      until: endDate
    }),
    breakdowns: 'hourly_stats_aggregated_by_advertiser_time_zone',  // Removed country breakdown
    time_increment: '1'
  });

  try {
    const response = await fetch(`${endpoint}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Facebook API Error: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching data for account ${accountId}:`, error);
    throw error;
  }
}

// Separate function for country breakdown
async function fetchAdSpendByCountry(
  accountId,
  accessToken,
  startDate,
  endDate
) {
  const baseUrl = 'https://graph.facebook.com/v21.0';
  const endpoint = `${baseUrl}/act_${accountId}/insights`;
  
  const params = new URLSearchParams({
    access_token: accessToken,
    level: 'ad',
    status : 'active,inactive',
    fields: 'campaign_id,campaign_name,adset_name,adset_id,ad_name,ad_id,spend,cost_per_action_type',
    time_range: JSON.stringify({
      since: startDate,
      until: endDate
    }),
    breakdowns: 'country',
    time_increment: '1'
  });

  try {
    const response = await fetch(`${endpoint}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Facebook API Error: ${JSON.stringify(errorData)}`);
    }
    console.log(JSON.stringify(await response.json(),null,2));
    return await response.json();
  } catch (error) {
    console.error(`Error fetching country data for account ${accountId}:`, error);
    throw error;
  }
}

async function getAllSpendData(accessToken, startDate, endDate) {
  try {
    // First, fetch all business managers
    console.log('Fetching business managers...');
    const businessManagers = await fetchBusinessManagers(accessToken);
    console.log(`Found ${businessManagers.length} business manager(s)`);

    // Then fetch all accessible ad accounts
    console.log('Fetching all ad accounts...');
    const accounts = await fetchAllAdAccounts(accessToken);
    console.log(`Found ${accounts.length} ad accounts`);

    // Fetch spend data for each account
    const spendData = [];
    
    // Process accounts in batches of 5 to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < accounts.length; i += batchSize) {
      const batch = accounts.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(accounts.length/batchSize)}`);
      
      const batchPromises = batch.map(async (account) => {
        try {
          // Fetch both hourly and country data
          const [hourlyData, countryData] = await Promise.all([
            fetchAdSpendByCountryAndHour(
              account.account_id,
              accessToken,
              startDate,
              endDate
            ),
            fetchAdSpendByCountry(
              account.account_id,
              accessToken,
              startDate,
              endDate
            )
          ]);
          
          const businessManagerName = businessManagers.length ? 
            businessManagers[0].name : 'Direct Access';
          
          return {
            accountId: account.account_id,
            accountName: account.name,
            businessManagerName,
            hourlyInsights: hourlyData.data,
            countryInsights: countryData.data
          };
        } catch (error) {
          console.error(`Failed to fetch data for account ${account.account_id}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      spendData.push(...batchResults.filter(result => result !== null));
      
      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < accounts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return spendData;
  } catch (error) {
    console.error('Error in getAllSpendData:', error);
    throw error;
  }
}

// Example usage and data export
async function main() {
  try {
    const options = {
      accessToken: 'EAAH0sCi3O0kBOyTZC1ItczLJl48FRYSTL22k27RkwJNA9lWWPkZCOx8L6kjZBZBXU7JWISUJZBBN2f9auZCkt9kSSZC4BoyWRcbpVn51NZCEGJjWI3y9lFK4gy6geSRiceNf7DMQe49esXaRAxhEfZCiA22bgNDWzVZCou49O1sjgNacMgdNClpZCbqZChmNpZAx2REBO',
      startDate: '2024-11-10',
      endDate: '2024-11-11'
    };

    const allSpendData = await getAllSpendData(
      options.accessToken,
      options.startDate,
      options.endDate
    );
    
    // Process and display results
    allSpendData.forEach(accountData => {
      console.log(`\nBusiness Manager: ${accountData.businessManagerName}`);
      console.log(`Account: ${accountData.accountName} (${accountData.accountId})`);
      
      console.log('\nHourly Data:');
      accountData.hourlyInsights.forEach(row => {
        console.log(`Hour: ${row.hourly_stats_aggregated_by_advertiser_time_zone}`);
        console.log(`Spend: ${row.spend}`);
        console.log(`Impressions: ${row.impressions}`);
        console.log(`Clicks: ${row.clicks}`);
        console.log('---');
      });

      console.log('\nCountry Data:');
      accountData.countryInsights.forEach(row => {
        console.log(`Country: ${row.country}`);
        console.log(`Spend: ${row.spend}`);
        console.log(`Impressions: ${row.impressions}`);
        console.log(`Clicks: ${row.clicks}`);
        console.log('---');
      });
    });

    // Export to JSON file
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `facebook_spend_data_${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(allSpendData, null, 2));
    console.log(`\nData exported to ${filename}`);

  } catch (error) {
    console.error('Main execution error:', error);
  }
}

// Run the script
main();