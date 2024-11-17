"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Sources_1 = __importDefault(require("./Sources"));
function doPost(event) {
    var outPut = ContentService.createTextOutput("").setMimeType(ContentService.MimeType.TEXT);
    handleDoPost(event).then((e) => {
        outPut = e;
    });
    return outPut;
}
async function handleDoPost(event) {
    try {
        const WEB_HOOK_SECRET = "TEST_SECRET";
        Logger.log(JSON.stringify(event.parameter));
        if (event.parameter.token && event.parameter.token === WEB_HOOK_SECRET) {
            const sourceType = event.parameter.sourceType; // Use EnumSources
            const storeName = event.parameter.storeName; // Get storeName from parameters
            if (!storeName) {
                return ContentService.createTextOutput("Missing storeName parameter").setMimeType(ContentService.MimeType.TEXT);
            }
            // Get the appropriate source and execute it
            const source = Sources_1.default.getSource(sourceType);
            if (source) {
                await source.execute(event.postData.contents, storeName);
                return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.TEXT);
            }
            else {
                throw new Error(`Invalid source type: ${sourceType}`);
            }
        }
        else {
            throw new Error("Invalid token");
        }
    }
    catch (e) {
        // Correct error type annotation
        Logger.log(`Error in doPost: ${e.message}`, e); // Log the full error object
        return ContentService.createTextOutput(`Webhook processing failed ${e.message}`).setMimeType(ContentService.MimeType.TEXT);
    }
}
