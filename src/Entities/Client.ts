interface iClientInfo {
  firstName: string;
  lastName?: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postCode?: string;
  country: string;
  email?: string;
  phone: string;
  customerIpAddress?: string;
  customerUserAgent?: string;
}

class Client {
  constructor(readonly info: iClientInfo) {}

  serialize() {
    return JSON.stringify(this.info);
  }

  static unserialize(data: string) {
    return new Client(JSON.parse(data));
  }
}


export default Client;