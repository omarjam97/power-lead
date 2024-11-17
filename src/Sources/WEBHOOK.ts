import GLogger from "../Monitor/GLogger";
import Sources, { EnumSources } from "./Sources";

/**
 *  DO POST TRIGGER
 *
 */
function doPost(event: GoogleAppsScript.Events.DoPost) {
  var outPut = ContentService.createTextOutput("").setMimeType(
    ContentService.MimeType.TEXT
  );
  try {
    handleDoPost(event).then((e) => {
      outPut = e;
    });
  } catch (e) {
    GLogger.critical({
      Context: "DO_POST",
      Info: `Unknown Error Occured in doPost : ${JSON.stringify(
        e
      )} | ${JSON.stringify(event)}`,
    });
  }
  return outPut;
}

function getWebHookSecret() {
  const secret =
    PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET");
  if (!secret) {
    return null;
  }
  return secret;
}

async function handleDoPost(event: GoogleAppsScript.Events.DoPost) {
  try {
    const WEB_HOOK_SECRET = getWebHookSecret();

    if (!WEB_HOOK_SECRET) {
      GLogger.warning({
        Context: "WEBHOOK_SOURCE",
        Info: "No Secret found for webhook please make sure to add a secret for the webhook",
      });
    }

    if (
      !WEB_HOOK_SECRET ||
      (event.parameter.token && event.parameter.token === WEB_HOOK_SECRET)
    ) {
      const sourceType: EnumSources = event.parameter.sourceType as EnumSources; // Use EnumSources
      const storeName = event.parameter.storeName; // Get storeName from parameters

      if (!storeName) {
        GLogger.warning({
          Context: "WEBHOOK_SOURCE",
          Info: "Webhook sending order without store please make sure that you are sending the store in the webhook",
        });
        return ContentService.createTextOutput(
          "Missing storeName parameter"
        ).setMimeType(ContentService.MimeType.TEXT);
      }

      // Get the appropriate source and execute it
      const source = Sources.getSource(sourceType);

      if (source) {
        await source.execute(event.postData.contents, storeName);
        return ContentService.createTextOutput("").setMimeType(
          ContentService.MimeType.TEXT
        );
      } else {
        GLogger.critical({
          Context: "WEBHOOK_SOURCE",
          Info: `webhook sending invalide source : ${source}`,
        });
        return ContentService.createTextOutput(
          `Webhook processing failed`
        ).setMimeType(ContentService.MimeType.TEXT);
      }
    } else {
      GLogger.critical({
        Context: "WEBHOOK_SOURCE",
        Info: `webhook sending invalide token : ${JSON.stringify(event)}`,
      });
      return ContentService.createTextOutput(
        `Webhook processing failed`
      ).setMimeType(ContentService.MimeType.TEXT);
    }
  } catch (e: any) {
    // Correct error type annotation
    GLogger.critical({
      Context: "WEBHOOK_SOURCE",
      Info: `Unknown Error Occured in handleDoPost : ${JSON.stringify(
        e
      )} | ${JSON.stringify(event)}`,
    });
    return ContentService.createTextOutput(
      `Webhook processing failed ${e?.message}`
    ).setMimeType(ContentService.MimeType.TEXT);
  }
}
