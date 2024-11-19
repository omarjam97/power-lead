import FB_ADS_METRICS from "./FB_ADS_METRICS ";
import FB_ADS_METRICS_PRE from "./FB_ADS_METRICS_PRE";

function getDailySpend(){
    FB_ADS_METRICS_PRE.getDailySpend();
}

function processBatches(){
    FB_ADS_METRICS.processBatches();
}


function FB_ADS_TRIGGERS(){
  ScriptApp.newTrigger("getDailySpend").timeBased().everyHours(1).create();
  ScriptApp.newTrigger("processBatches").timeBased().everyHours(1).create();
}

export {
    FB_ADS_TRIGGERS
}