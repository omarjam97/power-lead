interface fb_spend {
    campaign_name: string;
    campaign_id: string;

    adset_name: string;
    adset_id: string;
  
    ad_name: string;
    ad_id: string;

  spend: number;

  results: number;
  cost: number;
  objective: string;

  productID: string;
  store: string;
  country: string;

  start_date: string;
  end_date: string;
}

interface BM{
    id : string;
    name : string;
}

interface AdAccount{
    name : string;
    id : string;
    account_id : string;
    timezone_offset_hours_utc : number
    timezone_name : string
    timezone_id : number
    account_status : number
}

export{
    fb_spend,
    BM,
    AdAccount
}