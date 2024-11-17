import Countries from "../../Config/countries";
import Leads from "../../Entities/Leads";
import ProductInfo from "../../Entities/Products/ProductInfo";
import StoreProducts from "../../Entities/Products/StoreProducts";
import { SP } from "../../Global";
import GLogger from "../../Monitor/GLogger";
import AVLeadStatus, {
  LEAD_STATUS_TYPES,
  LeadStatus,
} from "../../Types/LeadStatus";
import Time from "../../Utils/time";
import { service } from "../services";

interface COD_IN_AFRICA_METADATA {
  order_id?: string;
  tracking_number?: string;
}

class COD_IN_AFRICA_SERVICE implements service {
  // trackOrder(Lead: Leads): Leads {
  //   throw new Error("Method not implemented.");
  // }

  private readonly context = "COD_IN_AFRICA_SERVICE";
  private getOptions(): GoogleAppsScript.URL_Fetch.URLFetchRequestOptions {
    const token = this.getClientToken();
    if (!token) {
      GLogger.critical({
        Context: this.context,
        Info: "Critical Error no JWT Found getOptions",
      });
      throw new Error("Critical Error no JWT Found");
    }
    return {
      method: "get",
      contentType: "application/json", // Important for sending JSON data
      headers: {
        Accept: "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
        Connection: "keep-alive",
        Origin: "https://manager.codinafrica.com",
        Referer: "https://manager.codinafrica.com/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "X-Auth-Token": `${token}`,
        "sec-ch-ua":
          '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
      },
      muteHttpExceptions: true, // Handle errors manually
    };
  }

  getAPICredentials() {
    const key = SP.getProperty("COD_IN_AFRICA_KEY");
    const secret = SP.getProperty("COD_IN_AFRICA_SECRET");

    if (!key || !secret) {
      GLogger.critical({
        Context: this.context,
        Info: "CRITICAL ERROR you should provide the key and secret for cod-in-africa getAPICredentials",
      });
      throw new Error(
        "CRITICAL ERROR you should provide the key and secret for cod-in-africa"
      );
    }

    return {
      key: key,
      secret: secret,
    };
  }

  setAPIToken(token: string) {
    SP.setProperty("COD_IN_AFRICA_TOKEN", token);
    SP.setProperty(
      "COD_IN_AFRICA_TOKEN_EXPIRE",
      (new Date().getTime() + 15 * 60 * 1000).toString()
    );
  }

  getStoredToken() {
    try {
      const expiryTime = SP.getProperty("COD_IN_AFRICA_TOKEN_EXPIRE");
      if (!expiryTime) {
        GLogger.critical({
          Context: this.context,
          Info: "!!!!! COD_IN_AFRICA_TOKEN_EXPIRE not found requires imidiate check",
        });
        return null;
      }
      // Check if token is expired (add 5 minutes buffer)
      const expireParsed = parseInt(expiryTime);
      if (new Date().getTime() > expireParsed) {
        return null;
      }

      return SP.getProperty("COD_IN_AFRICA_TOKEN");
    } catch (error) {
      GLogger.critical({
        Context: this.context,
        Info: `!!!!! Unknown error failed to get COD_IN_AFRICA_TOKEN getStoredToken requires imidiate check context : ${JSON.stringify(
          error
        )}`,
      });
      return null;
    }
  }

  getToken() {
    try {
      const storedToken = this.getStoredToken();
      if (storedToken) {
        return storedToken;
      }

      return this.connect();
    } catch (error) {
      GLogger.critical({
        Context: this.context,
        Info: `!!!!! Unknown error failed to get token in getToken function ${JSON.stringify(
          error
        )}`,
      });
    }
  }

  getClientToken() {
    try {
      const expiryTime = SP.getProperty("COD_IN_AFRICA_CLIENT_TOKEN_EXP");

      if (!expiryTime) {
        GLogger.critical({
          Context: this.context,
          Info: "!!!!! COD_IN_AFRICA_CLIENT_TOKEN_EXP not found requires imidiate check",
        });
        return null;
      }

      const expireParsed = parseInt(expiryTime);
      if (new Date().getTime() > expireParsed) {
        GLogger.critical({
          Context: this.context,
          Info: "!!!!! COD_IN_AFRICA_CLIENT_TOKEN expired requires imidiate change ",
        });
        return null;
      }

      const token = SP.getProperty("COD_IN_AFRICA_CLIENT_TOKEN");
      if (!token) {
        GLogger.critical({
          Context: this.context,
          Info: "!!!!! COD_IN_AFRICA_CLIENT_TOKEN not found requires imidiate check",
        });
        return null;
      }

      return token;
    } catch (error) {
      GLogger.critical({
        Context: this.context,
        Info: `!!!!! Unknown error failed to get COD_IN_AFRICA_CLIENT_TOKEN getClientToken requires imidiate check context : ${JSON.stringify(
          error
        )}`,
      });
      return null;
    }
  }

  connect() {
    try {
      const credentials = this.getAPICredentials();

      const response = UrlFetchApp.fetch(
        "https://api.codinafrica.com/api/users/apilogin",
        {
          method: "post",
          payload: {
            key: credentials.key,
            secret: credentials.secret,
          },
          muteHttpExceptions: true,
        }
      );

      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();

      if (responseCode !== 200) {
        //critical
        GLogger.critical({
          Context: this.context,
          Info: `!!!!! CODINAFRICA FAILED CONNECT REQUIRES IMIDIATE CHECK function:connect ${JSON.stringify(
            responseCode
          )} ${responseText}`,
        });
      }

      let parsedResponse;

      try {
        parsedResponse = JSON.parse(responseText);
      } catch (e) {
        GLogger.critical({
          Context: this.context,
          Info: `!!!!! CODINAFRICA FAILED CONNECT REQUIRES IMIDIATE CHECK Failed to parse API response:  ${JSON.stringify(
            responseCode
          )} ${responseText}`,
        });
      }

      if (!parsedResponse?.content?.token) {
        GLogger.critical({
          Context: this.context,
          Info: `!!!!! CODINAFRICA FAILED CONNECT REQUIRES IMIDIATE CHECK Token not found in API response:  ${JSON.stringify(
            responseCode
          )} ${responseText}`,
        });
      }

      const token = parsedResponse.content.token;

      this.setAPIToken(token);

      return token;
    } catch (error) {
      GLogger.critical({
        Context: this.context,
        Info: `!!!!! Unknown error failed to connect to codinafrica imidiate check connect : ${JSON.stringify(
          error
        )}`,
      });
    }
  }

  trackStock(productInfo: ProductInfo[]): boolean {
    const options = this.getOptions();
    productInfo.forEach((product) => {
      try {
        let response = UrlFetchApp.fetch(
          `https://api.codinafrica.com/api/products/find?name=${product.SKU}&limit=10`,
          options
        );
        //https://api.codinafrica.com/api/orders/get?id=6729ecc963fed3972f7c42a0
        let responseCode = response.getResponseCode();
        let data = JSON.parse(response.getContentText());

        if (responseCode != 200) {
          GLogger.critical({
            Context: this.context,
            Info: `!!!!! SERVER CODINAFRICA RESPONDED WITH NO CODE 200 in stock trackStock HTTP ${JSON.stringify(
              responseCode
            )} ${data}`,
          });
        }

        if (data.status != 200) {
          GLogger.critical({
            Context: this.context,
            Info: `!!!!! SERVER CODINAFRICA RESPONDED WITH NO CODE 200 in stock trackStock PAYLOAD ${JSON.stringify(
              responseCode
            )} ${data}`,
          });
        }

        data.content.results[0].details.forEach((element) => {
          if (element.country == product.Country) {
            product.updateStock(
              element.quantity.inStock,
              element.quantity.total
            );
          }
        });
      } catch (error) {
        GLogger.critical({
          Context: this.context,
          Info: `!!!!! Unknown error failed to connect to codinafrica imidiate check trackStock : ${JSON.stringify(
            error
          )}`,
        });
      }
    });
    return false;
  }

  getTrackingNumber(orderId: string, country: Countries): string | null {
    try {
      const response = UrlFetchApp.fetch(
        `https://api.codinafrica.com/api/shippings/find?name=${orderId}&limit=10&country=${country}`,
        this.getOptions()
      );
      const responseCode = response.getResponseCode();
      const data = JSON.parse(response.getContentText());
      if (
        responseCode != 200 ||
        data.status != 200 ||
        !data.content ||
        !data.content.results ||
        !data.content.results[0] ||
        !data.content.results[0]._id
      ) {
        GLogger.critical({
          Context: this.context,
          Info: `!!!!! SERVER CODINAFRICA RESPONDED WITH NO CODE 200 in stock getTrackingNumber ${orderId} ${country} ${JSON.stringify(
            responseCode
          )} ${JSON.stringify(data)}`,
        });
        return null;
      }
      return data.content.results[0]._id;
    } catch (error) {
      GLogger.critical({
        Context: this.context,
        Info: `!!!!! Unknown error failed to connect to codinafrica imidiate check getTrackingNumber: ${JSON.stringify(
          error
        )}`,
      });
      return null;
    }
  }

  trackOrder(Lead: Leads) {
    const options = this.getOptions();
    try {
      if (!Lead.ServiceMetaData) {
        GLogger.critical({
          Context: this.context,
          Info: `!!!!! no meta data found in lead when trying to track please make sure that you validating leads before trackin trackOrder ${JSON.stringify(
            Lead
          )}`,
        });
        return;
      }
      const metadata: COD_IN_AFRICA_METADATA = JSON.parse(Lead.ServiceMetaData);
      if (!metadata.order_id && !metadata.tracking_number) {
        GLogger.critical({
          Context: this.context,
          Info: `!!!!! no tracking or orderid found in meta data trackOrder ${JSON.stringify(
            Lead
          )}`,
        });
        return;
      }

      if (metadata.order_id && !metadata.tracking_number) {
        let response = UrlFetchApp.fetch(
          `https://api.codinafrica.com/api/statusHistories/search?order=${metadata.order_id}&limit=100`,
          options
        );

        let responseCode = response.getResponseCode();
        let data = JSON.parse(response.getContentText());

        if (responseCode != 200) {
          GLogger.critical({
            Context: this.context,
            Info: `!!!!! COD IN AFRICA RESPONDED WITH NO 200 trackOrder HTTP CALLCENTER ${JSON.stringify(
              responseCode
            )} | ${JSON.stringify(data)}`,
          });
          return;
        }

        if (!data?.content || !data.content.results || data?.status != 200) {
          if (data?.status == 404) {
            //check if order double
            //https://api.codinafrica.com/api/orders/get?id=6734eca4428a797262dddcd3
            let responseDouble = UrlFetchApp.fetch(
              `https://api.codinafrica.com/api/orders/get?id=${metadata.order_id}`,
              options
            );
            let parsedDouble = JSON.parse(responseDouble.getContentText());
            if (
              parsedDouble?.content?.status?.name &&
              parsedDouble?.content?.status?.name == "double"
            ) {
              Lead.updateBulkStatus(LEAD_STATUS_TYPES.CALL_CENTER, [
                {
                  current: AVLeadStatus.DOUBLE,
                  date:
                    new Date(parsedDouble?.content?.updatedAt).getTime() +
                    3600000,
                  note: "order DOUBLE",
                  prev: null,
                },
              ]);
            }
            return;
          }
          GLogger.critical({
            Context: this.context,
            Info: `!!!!! COD IN AFRICA RESPONDED WITH NO 200 trackOrder PAYLOAD CALLCENTER ${JSON.stringify(
              responseCode
            )} | ${JSON.stringify(data)}`,
          });
          return;
        }
        // Logger.log(`PREV : ${lead.status} | NEW : ${data?.content?.status?.name}`);
        // Lead.updateStatus(data?.content?.status?.name);
        //UNREACHED_END
        if (
          data.content.results[0].status.name == AVLeadStatus.UNREACHED &&
          data.content.results[0].comment ===
            "Unreached automatique par le système"
        ) {
          Lead.updateBulkStatus(
            LEAD_STATUS_TYPES.CALL_CENTER,
            data.content.results.map((status, index) => {
              return {
                note: status.comment || "",
                date: new Date(status.date).getTime(),
                prev: status.previousStatus.name,
                current:
                  index == 0 ? AVLeadStatus.UNREACHED_END : status.status.name,
              };
            })
          );
          return;
        }

        if (data.content.results[0].status.name == AVLeadStatus.CONFIRMED) {
          const tracking = this.getTrackingNumber(
            Lead.ID,
            Lead.Country as Countries
          );

          if (tracking) {
            Lead.ServiceMetaData = JSON.stringify({
              order_id: metadata.order_id,
              tracking_number: tracking,
            });
          } else {
            GLogger.warning({
              Context: this.context,
              Info: `!!!!! COD IN AFRICA ORDER WITH ID ${Lead.ID} confirmed with no Tracking`,
            });
          }
        }

        Lead.updateBulkStatus(
          LEAD_STATUS_TYPES.CALL_CENTER,
          data.content.results.map(
            (status) =>
              ({
                note: status.comment || "",
                date: new Date(status.date).getTime(),
                prev: status.previousStatus.name,
                current: status.status.name,
              } as LeadStatus)
          )
        );
        return;
      }

      if (metadata.tracking_number) {
        let response_ = UrlFetchApp.fetch(
          `https://api.codinafrica.com/api/shippingsHistories/search?shipping=${metadata.tracking_number}`,
          options
        );
        //https://api.codinafrica.com/api/shippings/get?id=
        let responseCode_ = response_.getResponseCode();
        let data_ = JSON.parse(response_.getContentText());

        if (responseCode_ != 200) {
          GLogger.critical({
            Context: this.context,
            Info: `!!!!! COD IN AFRICA RESPONDED WITH NO 200 trackOrder HTTP shipping ${JSON.stringify(
              responseCode_
            )} | ${JSON.stringify(data_)}`,
          });
          return;
        }

        if (!data_?.content || !data_.content.results || data_?.status != 200) {
          GLogger.critical({
            Context: this.context,
            Info: `!!!!! COD IN AFRICA RESPONDED WITH NO 200 results or content not found trackOrder PAYLOAD shipping ${JSON.stringify(
              responseCode_
            )} | ${JSON.stringify(data_)}`,
          });
          return;
        }

        Lead.updateBulkStatus(
          LEAD_STATUS_TYPES.SHIPPING,
          data_.content.results.map(
            (status) =>
              ({
                note: status.comment || "",
                date: new Date(status.date).getTime(),
                prev: null,
                current: status.status,
              } as LeadStatus)
          )
        );
        return;
      }
    } catch (error) {
      GLogger.critical({
        Context: this.context,
        Info: `!!!!! Unknown error failed to connect to codinafrica imidiate check trackOrder : ${JSON.stringify(
          error
        )}`,
      });
    }
  }

  processOrder(Lead: Leads): Leads | void {
    try {
      const token = this.getToken();
      // Transform lead data to COD IN AFRICA format
      var orderData = {
        orderId: Lead.ID /* Order id  */,
        fullName: `${Lead.Client.info.firstName} ${Lead.Client.info.lastName}` /* customer Name  */,
        phone: Lead.Client.info.phone /* customer phone  */,
        country: Lead.Country /* country code  */,
        city: Lead.Client.info.city,
        address: `${Lead.Client.info.address_1} ${Lead.Client.info.address_2}`,
        total: Lead.Total /* Total price order  */,
        storeName: Lead.Store /* Store Name  */,
        items: Lead.Cart.products.map((product) => {
          var productInfo = StoreProducts.getProduct(
            Lead.Store,
            product.productId,
            Lead.Country as Countries
          );

          if (!productInfo?.length) {
            Lead.updateSystemStatus({
              current: AVLeadStatus.DEAD,
              note: `product with id ${product.productId} is not found in product Info for country ${Lead.Country} | ${Lead.ID}`,
            });
            throw new Error("DEAD");
          } else if (productInfo.length > 1) {
            //warning
          }
          return {
            name: productInfo[0].SKU /* Name product  */,
            code: productInfo[0].SKU /* id or code product   */,
            quantity: product.quantity,
            price: Lead.Total /* Unit price product  */,
          };
        }),
      };

      let options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
        method: "post",
        contentType: "application/json", // Important for sending JSON data
        headers: {
          "x-auth-token": `${token}`,
        },
        payload: JSON.stringify(orderData), // Stringify the payload
        muteHttpExceptions: true, // Handle errors manually
      };

      let response = UrlFetchApp.fetch(
        "https://api.codinafrica.com/api/orders/apicreate",
        options
      );

      let responseCode = response.getResponseCode();

      //Second Attemp refreshing the tokens
      if (responseCode == 401) {
        const newToken = this.connect();
        options = {
          method: "post",
          contentType: "application/json", // Important for sending JSON data
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
          payload: JSON.stringify(orderData), // Stringify the payload
          muteHttpExceptions: true, // Handle errors manually
        };
        response = UrlFetchApp.fetch(
          "https://api.codinafrica.com/api/orders/apicreate",
          options
        );
        responseCode = response.getResponseCode();
        if (responseCode == 401) {
          //Critical
          GLogger.critical({
            Context: this.context,
            Info: `!!!!! REQUIRE IMIDIATE CHECK POSSIBLE CODINAFRICA KEY incorrect processOrder ${JSON.stringify(
              responseCode
            )} | ${JSON.stringify(response.getContentText())}`,
          });
          throw new Error(`Require check now ${response.getContentText()}`);
        }
      }

      const responseText = response.getContentText();

      const parsedResponse = JSON.parse(responseText);
      if (
        responseCode === 200 ||
        responseCode === 201 ||
        !parsedResponse?.status
      ) {
        // 201 is also a success (resource created)

        // Return the order id, adjust based on actual API response structure
        if (
          parsedResponse?.status == 401 &&
          parsedResponse?.content.includes("Duplicate Order")
        ) {
          //Order ID ALREADY EXISTS MARK ORDER DOUBLE
          Lead.updateBulkStatus(LEAD_STATUS_TYPES.CALL_CENTER, [
            {
              current: AVLeadStatus.DOUBLE,
              date: Time.getCurrentTime() + 3600000,
              note: `order ID DOUBLE ${Lead.ID}`,
              prev: null,
            },
          ]);
          return;
        }

        if (!parsedResponse?.id_order) {
          GLogger.critical({
            Context: this.context,
            Info: `!!!!! service did not send order id processOrder ${responseCode}, Response: ${parsedResponse}`,
          });

          throw new Error(
            `!!!!! service did not send order id processOrder ${responseCode}, Response: ${parsedResponse}`
          );
        }

        Lead.ServiceMetaData = JSON.stringify({
          order_id: parsedResponse.id_order,
        });

        Lead.updateSystemStatus({
          current: AVLeadStatus.SENT,
          note: "",
        });

        return Lead;
      } else {
        GLogger.critical({
          Context: this.context,
          Info: `!!!!! processOrder Failed to create order. Status: ${responseCode}, Response: ${responseText}`,
        });
        throw new Error(
          `Failed to create order. Status: ${responseCode}, Response: ${responseText}`
        );
      }
    } catch (error) {
      Lead.addAttempt();
      GLogger.warning({
        Context: this.context,
        Info: `!!!!! Unknown error failed processOrder${Lead.ID}: ${error.message}`,
      });
    }
    return Lead;
  }

  getDefaultMetaData(): string {
    return JSON.stringify({});
  }
}

export default COD_IN_AFRICA_SERVICE;
