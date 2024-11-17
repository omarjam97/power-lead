"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const StoreProducts_1 = __importDefault(require("../../Entities/Products/StoreProducts"));
const Global_1 = require("../../Global");
const LeadStatus_1 = __importDefault(require("../../Types/LeadStatus"));
class COD_IN_AFRICA_SERVICE {
    trackOrder(Lead) {
        throw new Error("Method not implemented.");
    }
    getOptions() {
        const token = this.getClientToken();
        if (!token) {
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
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "X-Auth-Token": `${token}`,
                "sec-ch-ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Linux"',
            },
            muteHttpExceptions: true, // Handle errors manually
        };
    }
    getAPICredentials() {
        const key = Global_1.SP.getProperty("COD_IN_AFRICA_KEY");
        const secret = Global_1.SP.getProperty("COD_IN_AFRICA_SECRET");
        if (!key || !secret) {
            throw new Error("CRITICAL ERROR you should provide the key and secret for cod-in-africa");
        }
        return {
            key: key,
            secret: secret,
        };
    }
    setAPIToken(token) {
        Global_1.SP.setProperty("COD_IN_AFRICA_TOKEN", token);
        Global_1.SP.setProperty("COD_IN_AFRICA_TOKEN_EXPIRE", (new Date().getTime() + 15 * 60 * 1000).toString());
    }
    getStoredToken() {
        const expiryTime = Global_1.SP.getProperty("COD_IN_AFRICA_TOKEN_EXPIRE");
        if (!expiryTime) {
            return null;
        }
        // Check if token is expired (add 5 minutes buffer)
        const expireParsed = parseInt(expiryTime);
        if (new Date().getTime() > expireParsed) {
            return null;
        }
        return Global_1.SP.getProperty("COD_IN_AFRICA_TOKEN");
    }
    getToken() {
        try {
            const storedToken = this.getStoredToken();
            if (storedToken) {
                return storedToken;
            }
            return this.connect();
        }
        catch (error) {
            throw new Error(`Failed to obtain valid token: ${error.message}`);
        }
    }
    getClientToken() {
        try {
            const expiryTime = Global_1.SP.getProperty("COD_IN_AFRICA_CLIENT_TOKEN_EXP");
            if (!expiryTime) {
                return null;
            }
            const expireParsed = parseInt(expiryTime);
            if (new Date().getTime() > expireParsed) {
                return null;
            }
            const token = Global_1.SP.getProperty("COD_IN_AFRICA_CLIENT_TOKEN");
            if (!token) {
                return null;
            }
            return token;
        }
        catch (error) {
            Logger.log(`Failed to retrieve stored token: ${error.message}`);
            return null;
        }
    }
    connect() {
        var _a;
        try {
            const credentials = this.getAPICredentials();
            const response = UrlFetchApp.fetch("https://api.codinafrica.com/api/users/apilogin", {
                method: "post",
                payload: {
                    key: credentials.key,
                    secret: credentials.secret,
                },
                muteHttpExceptions: true,
            });
            const responseCode = response.getResponseCode();
            const responseText = response.getContentText();
            if (responseCode !== 200) {
                //critical
                throw new Error(`API request failed with status ${responseCode}: ${responseText}`);
            }
            let parsedResponse;
            try {
                parsedResponse = JSON.parse(responseText);
            }
            catch (e) {
                throw new Error(`Failed to parse API response: ${responseText}`);
            }
            if (!((_a = parsedResponse === null || parsedResponse === void 0 ? void 0 : parsedResponse.content) === null || _a === void 0 ? void 0 : _a.token)) {
                throw new Error("Token not found in API response");
            }
            const token = parsedResponse.content.token;
            this.setAPIToken(token);
            return token;
        }
        catch (error) {
            Logger.log(`CRITICAL Error details: ${error.message}`);
            throw error;
        }
    }
    trackStock(productInfo) {
        const options = this.getOptions();
        productInfo.forEach((product) => {
            try {
                let response = UrlFetchApp.fetch(`https://api.codinafrica.com/api/products/find?name=${product.SKU}&limit=10`, options);
                //https://api.codinafrica.com/api/orders/get?id=6729ecc963fed3972f7c42a0
                let responseCode = response.getResponseCode();
                let data = JSON.parse(response.getContentText());
                if (responseCode != 200) {
                    throw new Error("Critical" + JSON.stringify(data));
                }
                if (data.status != 200) {
                    throw new Error("Critical 2" + JSON.stringify(data));
                }
                data.content.results[0].details.forEach((element) => {
                    if (element.country == product.Country) {
                        product.updateStock(element.quantity.inStock, element.quantity.total);
                    }
                });
                Logger.log("STOCK TRACKER WITH SUCCESS");
            }
            catch (e) {
                Logger.log(JSON.stringify(e));
            }
        });
        return false;
    }
    // trackOrder(Lead: Leads): Leads {
    //   const options = this.getOptions();
    //   try {
    //     if (!Lead.ServiceMetaData) {
    //       throw new Error("");
    //     }
    //     const metadata: COD_IN_AFRICA_METADATA = JSON.parse(Lead.ServiceMetaData);
    //     if (!metadata.order_id) {
    //       throw new Error("");
    //     }
    //     if (!metadata.tracking_number) {
    //       let response = UrlFetchApp.fetch(
    //         `https://api.codinafrica.com/api/statusHistories/search?order=${metadata.order_id}&limit=100`,
    //         options
    //       );
    //       let responseCode = response.getResponseCode();
    //       let data = JSON.parse(response.getContentText());
    //       if (responseCode != 200) {
    //         throw new Error(
    //           `something went wrong Error 1 ${JSON.stringify(data)}`
    //         );
    //       }
    //       if (!data?.content || !data.content.results || data?.status != 200) {
    //         throw new Error(
    //           `something went wrong Error 2 ${JSON.stringify(data)}`
    //         );
    //       }
    //       // Logger.log(`PREV : ${lead.status} | NEW : ${data?.content?.status?.name}`);
    //       // Lead.updateStatus(data?.content?.status?.name);
    //       const callcenter_status: {
    //         date: string;
    //         prevStatus: string;
    //         currentStatus: string;
    //         note: string;
    //       }[] = [];
    //       data.content.results.forEach((status) => {
    //         callcenter_status.push({
    //           date: status.date,
    //           prevStatus: status.previousStatus.name,
    //           currentStatus: status.status.name,
    //           note: status.comment,
    //         });
    //       });
    //       const currentLeadStatus = Lead.getStatus();
    //       Object.getOwnPropertyNames(currentLeadStatus).forEach((status) => {
    //         currentLeadStatus.forEach((lead) => {
    //         })
    //       })
    //     } else {
    //     }
    //   } catch (e) {}
    // }
    processOrder(Lead) {
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
                    var productInfo = StoreProducts_1.default.getProduct(Lead.Store, product.productId, Lead.Country);
                    if (!(productInfo === null || productInfo === void 0 ? void 0 : productInfo.length)) {
                        Lead.updateSystemStatus({
                            current: LeadStatus_1.default.DEAD,
                            note: `product with id ${product.productId} is not found in product Info for country ${Lead.Country} | ${Lead.ID}`,
                        });
                        throw new Error("DEAD");
                    }
                    else if (productInfo.length > 1) {
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
            let options = {
                method: "post",
                contentType: "application/json", // Important for sending JSON data
                headers: {
                    "x-auth-token": `${token}`,
                },
                payload: JSON.stringify(orderData), // Stringify the payload
                muteHttpExceptions: true, // Handle errors manually
            };
            let response = UrlFetchApp.fetch("https://api.codinafrica.com/api/orders/apicreate", options);
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
                response = UrlFetchApp.fetch("https://api.codinafrica.com/api/orders/apicreate", options);
                responseCode = response.getResponseCode();
                if (responseCode == 401) {
                    //Critical
                    throw new Error(`Require check now ${response.getContentText()}`);
                }
            }
            const responseText = response.getContentText();
            const parsedResponse = JSON.parse(responseText);
            if (responseCode === 200 ||
                responseCode === 201 ||
                !(parsedResponse === null || parsedResponse === void 0 ? void 0 : parsedResponse.status)) {
                // 201 is also a success (resource created)
                Logger.log(`Order created successfully: ${JSON.stringify(parsedResponse)}`);
                // Return the order id, adjust based on actual API response structure
                Lead.updateSystemStatus({
                    current: LeadStatus_1.default.SENT,
                    note: '',
                });
                Lead.ServiceMetaData = JSON.stringify({
                    order_id: parsedResponse.id_order,
                });
                return Lead;
            }
            else {
                throw new Error(`Failed to create order. Status: ${responseCode}, Response: ${responseText}`);
            }
        }
        catch (e) {
            Lead.addAttempt();
            Logger.log(`Error processing order for lead ${Lead.ID}: ${e.message}`);
        }
    }
    getDefaultMetaData() {
        return JSON.stringify({});
    }
}
exports.default = COD_IN_AFRICA_SERVICE;
