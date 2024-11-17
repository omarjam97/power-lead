import { SS } from "../Global";
import Time from "../Utils/time";

enum LogLevels {
  CRITICAL = "CRITICAL",
  WARNING = "WARNING",
  INFO = "INFO",
  ERROR = "ERROR",
}

class GLogger {
  static readonly enabled = new Set([
    LogLevels.CRITICAL,
    LogLevels.WARNING,
    LogLevels.ERROR,
    LogLevels.INFO,
  ]);

  static sheetName: string = "LOGS_TABLES";
  
  static header: string[] = ["Level", "Context", "Info", "CreateAt"];

  static getSheet() {
    return SS.getSheetByName(
      GLogger.sheetName
    ) as GoogleAppsScript.Spreadsheet.Sheet;
  }

  static critical(options: { Info: string; Context: string | null }) {
    GLogger.log({
      logLevel: LogLevels.CRITICAL,
      Context: options.Context,
      Info: options.Info,
    });
  }

  static info(options: { Info: string; Context: string | null }) {
    GLogger.log({
      logLevel: LogLevels.INFO,
      Context: options.Context,
      Info: options.Info,
    });
  }

  static error(options: { Info: string; Context: string | null }) {
    GLogger.log({
      logLevel: LogLevels.ERROR,
      Context: options.Context,
      Info: options.Info,
    });
  }

  static warning(options: { Info: string; Context: string | null }) {
    GLogger.log({
      logLevel: LogLevels.WARNING,
      Context: options.Context,
      Info: options.Info,
    });
  }

  static log(options: {
    logLevel: LogLevels;
    Info: string;
    Context: string | null;
  }) {
    if (GLogger.enabled.has(options.logLevel)) {
      GLogger.getSheet().appendRow([
        options.logLevel,
        options.Context || "UNKNOWN",
        options.Info,
        Time.getCurrentTime(),
      ]);
    }
  }

}

export default GLogger;
