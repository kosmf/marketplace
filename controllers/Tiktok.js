const axios = require('axios');
const response = require("@Components/response")
const { salesorderdetails, salesorders, debtorsmaster, custbranch, log_marketplace, log_rpc } = require("@Configs/database")
const moment = require('moment');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate SHA-256 signature.
 * @param {string} path - API path, for example, "/api/orders".
 * @param {Object} queries - Extract all query params EXCEPT 'sign' and 'access_token'.
 * @param {string} secret - App secret.
 * @returns {string} - SHA-256 signature.
 */
function generateSHA256(path, queries, secret, bodyReq = null) {
    // Reorder the params based on alphabetical order.
    const keys = Object.keys(queries).sort();

    // Concatenate all the params in the format of {key}{value} and append the request path to the beginning.
    let input = path;
    keys.forEach((key) => {
        input += key + queries[key];
    });

    if(bodyReq) input += JSON.stringify(bodyReq)

    // Wrap the string generated in with app_secret.
    input = secret + input + secret;

    console.log("RAW BEFORE HMAC : "+input)
    // Encode the digest byte stream in hexadecimal and use SHA-256 to generate a signature with salt (secret).
    const hmac = crypto.createHmac('sha256', secret);

    // Error handling
    try {
        hmac.update(input);
        const signature = hmac.digest('hex');
        return signature;
    } catch (error) {
        // Handle the error here, e.g., log it
        console.error(error);
        return '';
    }
}

const getShops = async (APP_KEY, APP_SECRET,tokenContent) => {
  
  // const APP_KEY = '68hu8siqkegus'
  // const APP_SECRET = '79236fdf1368a7e8a9ad5f4fee19fb776b9a5cc6'
  // const AUTH_CODE = 'ROW_rtmUtwAAAAAf8YK4fSExCY5dprMo1m4k2h8WeluVLhWpYqz970cUU9Ri6KXtDTtSSciWDcBTnCC3v8guvUoeCsmifmztNfpLXFHBRmDDrtvzBm5eLLN_XY9fFWwr7KPCJDmy42I1IEJghiyGPjgsnozaer8d9wJl6s4Tepw0CKQlJYHoAm9QVA'

  // const jakartaTimezone = 'Asia/Jakarta';
  // const TIMESTAMP = moment().tz(jakartaTimezone).unix();

  // console.log({ TIMESTAMP: TIMESTAMP });

  // const dateTimeString = moment.unix(currentDate).format('YYYY-MM-DD HH:mm:ss');
  
  // Convert currentDate to Unix timestamp in seconds
  const TIMESTAMP = Math.floor(moment().utc().valueOf() / 1000);
  // const TIMESTAMP2 = Math.floor(new Date() / 1000);

  // console.log({ TIMESTAMP: TIMESTAMP, TIMESTAMP2: TIMESTAMP2})

  // return response.res200(res, "000", "Success", { currentDate: currentDate })

  const path = '/authorization/202309/shops';
  const queries = {
      app_key: APP_KEY,
      timestamp: TIMESTAMP
  };

  const SIGNATURE = generateSHA256(path, queries, APP_SECRET);
  console.log({ SIGNATURE: SIGNATURE});

  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://open-api.tiktokglobalshop.com/authorization/202309/shops?app_key='+APP_KEY+'&sign='+SIGNATURE+'&timestamp='+TIMESTAMP+"&access_token="+tokenContent,
    headers: {
      'content-type': 'application/json',
      'x-tts-access-token':tokenContent
     }
  };
  
  let shopLists = await axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));

    return response.data;
  })
  .catch((error) => {
    // The request failed
    console.error('GET request failed:', error);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log("Error Request : ");
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    console.log(error.config);

    return error;
  });

  return shopLists;
}

exports.getShops = async (req, res) => {

  const shopId = req.params.shopId

  console.log({ shopId: shopId});

  const debtOrsmaster = await debtorsmaster.findOne({
    raw: true,
    where: {
      idseller: shopId
    }
  })

  const APP_KEY = debtOrsmaster.app_key
  const APP_SECRET = debtOrsmaster.app_secret
  const accessToken = debtOrsmaster.token

  const jakartaTimezone = 'Asia/Jakarta';
  // const TIMESTAMP = moment().tz(jakartaTimezone).unix();

  // console.log({ TIMESTAMP: TIMESTAMP });

  // const dateTimeString = moment.unix(currentDate).format('YYYY-MM-DD HH:mm:ss');
  
  // Convert currentDate to Unix timestamp in seconds
  const TIMESTAMP = Math.floor(new Date() / 1000);

  // return response.res200(res, "000", "Success", { currentDate: currentDate })

  const path = '/authorization/202309/shops';
  const queries = {
      app_key: APP_KEY,
      timestamp: TIMESTAMP
  };

  const SIGNATURE = generateSHA256(path, queries, APP_SECRET);
  console.log({ SIGNATURE: SIGNATURE});

  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://open-api.tiktokglobalshop.com/authorization/202309/shops?app_key='+APP_KEY+'&sign='+SIGNATURE+'&timestamp='+TIMESTAMP+"&access_token="+accessToken,
    headers: {
      'content-type': 'application/json',
      'x-tts-access-token': accessToken
     }
  };
  
  let shopLists = await axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));

    return response.data;
  })
  .catch((error) => {
    console.log(error);

    return error.response.data
  });
  
  const updateCipher = await debtorsmaster.update(
    {
      cipher: shopLists.data.shops[0].cipher
    },
    {
      where: {
        idseller: shopId
      }
    })

  console.log({ updateCipher: updateCipher })

  return response.res200(res, "000", "Success", { shopLists: shopLists })
}

exports.refreshTokenInternal = async (shopId) => {

  console.log({ shopId: shopId});

  const debtOrsmaster = await debtorsmaster.findOne({
    raw: true,
    where: {
      idseller: shopId
    }
  })

  const APP_KEY = debtOrsmaster.app_key
  const APP_SECRET = debtOrsmaster.app_secret
  const refreshTokenContent = debtOrsmaster.refresh_token

  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://auth.tiktok-shops.com/api/v2/token/refresh?app_key='+APP_KEY+'&refresh_token='+refreshTokenContent+'&app_secret='+APP_SECRET+'&grant_type=refresh_token',
    headers: { }
  };

  console.log({ req: config})
  
  const refreshToken = await axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));

    return response.data;
  })
  .catch((error) => {
    console.log(error);
  });
  
  const updateToken = await debtorsmaster.update(
    {
      token: refreshToken.data.access_token,
      refresh_token: refreshToken.data.refresh_token
    },
    {
      where: {
        idseller: shopId
      }
    })

  console.log({ updateToken: updateToken })

  const payloadReturn = { 
    req: config, 
    refreshToken: refreshToken 
  }

  return payloadReturn;
}

exports.getOrderListInternal = async (shopId) => {

  // Get current date
  const currentDate = moment();
  
  // Calculate yesterday's date
  const yesterdayDate = currentDate.clone().subtract(7, 'day');
  
  // Set the time to 00:00:00 for yesterday
  const fromTime = yesterdayDate.startOf('day').unix();

  // Calculate the end date (yesterday)
  // const endDate = currentDate.clone().subtract(1, 'day');
  
  // Set the time to 23:59:59 for yesterday
  // const toTime = endDate.endOf('day').unix();

  // Now
  const toTime = moment().unix();
  
  console.log('Unix timestamp for from_date (00:00):', fromTime);
  console.log('Unix timestamp for to_date (23:59):', toTime);

  const timestamp = Math.floor(moment().valueOf() / 1000);
  // const timestamp = Math.floor(new Date() / 1000);

  // const tokenContent = await readFileAsync(shopId+'/token.txt');

  const debtOrsmaster = await debtorsmaster.findOne({
    raw: true,
    where: {
      idseller: shopId
    }
  })

  const custBranch = await custbranch.findOne({
    raw: true,
    where: {
      debtorno: debtOrsmaster?.debtorno ?? "831"
    }
  })

  const soTrx = await salesorders.findAll({
    where: {
      marketplace: "Tiktok",
      // migration: '1',
      // executed: {
      //   [Op.between]: [
      //     moment(moment.tz(jakartaTimezone)).subtract(7, 'days').set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toDate(),
      //     moment(moment.tz(jakartaTimezone)).toDate()
      //   ]
      // }
    }
  });

  const customerRefs = soTrx.map(order => order.customerref);

  console.log("customerRefs : ",customerRefs)

  const APP_KEY = debtOrsmaster.app_key;
  const APP_SECRET = debtOrsmaster.app_secret;
  const tokenContent = debtOrsmaster.token;

  // Example usage:
  const orderStatus = ['IN_TRANSIT', 'DELIVERED', 'COMPLETED']
  const path = '/order/202309/orders/search';
  // const shopCipher = 'ROW_c9_f1AAAAAAJtT-cuRVqJ1P4KZz8oLcP'
  let   pageToken = ''
  let   orders = []

  let shopCipher = await getShops(APP_KEY, APP_SECRET,tokenContent).then((resApi) => {
    console.log("RES API : ", resApi)
    if(resApi.code == 0 && resApi.data.shops.length){
      return resApi.data.shops[0].cipher;
    } else {
      return "-";
    }
  })

  if(shopCipher == "-") {
    console.log("Shop Cipher not Found")
    return response.res200(res, "001", "Get ShopList Failed", {})
  }

  let orderList = await Promise.all(orderStatus.map(async (status) => {
    console.log({ status: status })

    let i = 1;

    while(1){
      console.log({ i: i})

      let data = {
        order_status: status,
        create_time_ge: fromTime,
        create_time_lt: toTime
      }

      let queries = {
          app_key: APP_KEY,
          page_size: 20,
          shop_cipher: shopCipher,
          timestamp: timestamp
      };

      if (pageToken != '') queries.page_token = pageToken;

      const signature = generateSHA256(path, queries, APP_SECRET, data);
      console.log(signature);

      let url = `https://open-api.tiktokglobalshop.com/order/202309/orders/search?app_key=${APP_KEY}&timestamp=${timestamp}&sign=${signature}&access_token=${tokenContent}&page_size=${queries.page_size}&shop_cipher=${shopCipher}`

      if (pageToken != '') url += `&page_token=${pageToken}`;

      // console.log({ url: url, queries: queries})

      let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: url,
          headers: {
              'Content-Type': 'application/json',
              'x-tts-access-token': tokenContent
          },
          data: data
      };

      console.log({ reqConfig: config })

      try {

        const uidLog = uuidv4();
      
        const reqGOLog = {
          uid: uidLog,
          payload: config,
          marketplace: 'Tiktok',
          shop_id: shopId,
          executed: new Date(),
          api: 'getOrders',
          phase: 'Request',
          id: uuidv4()
        }
      
        let insertReqGOLog = await log_marketplace.create(reqGOLog);
      
        console.log( {insertReqGOLog:insertReqGOLog });

        const response = await axios.request(config);
        console.log({ response: response.data.data })

        const resGOLog2 = {
          uid: uidLog,
          payload: response.data,
          marketplace: 'Tiktok',
          shop_id: shopId,
          executed: new Date(),
          api: 'getOrders',
          phase: 'Response',
          id: uuidv4()
        }
    
        let insertResGOLog2 = await log_marketplace.create(resGOLog2);
        console.log( {insertResGOLog2:insertResGOLog2 });
        
        if(!response.data.data.orders) return 0;
        if(response.data.data.next_page_token != '') {
          pageToken = response.data.data.next_page_token
          console.log("NEXT PAGE: "+pageToken)
        }
        else {
          pageToken = ''
          console.log("PAGE TOKEN KOSONG")
        }

        orders = [...orders, ...response.data.data.orders]
        // orders = response.data.data.orders

        // return response.data;
      } catch (error) {
        console.log(error);
        pageToken = ''
      }

      if(pageToken == '') break;
      ++i;
    }

    return orders;

    }));

  // Flatten the array of arrays into a single array
  orders = orderList.flat().filter(order => order !== 0);

  let filteredOrders = orders.filter(order => !customerRefs.includes(order.id.toString()));
  console.log({ filteredOrders: filteredOrders})

  filteredOrders.map(async(order) => {

    let orderNo = uuidv4();

    let address = {}

    const districtInfo = await order.recipient_address.district_info;
    districtInfo.forEach(item => {
      address[item.address_level_name.toLowerCase()] = item.address_name;
    });

    let payloadSO = {
        orderno: orderNo,
        debtorno: custBranch.debtorno,
        branchcode: custBranch.branchcode,
        customerref: order.id,
        buyername: order.buyer_email,
        comments: order.buyer_message,
        orddate: moment.unix(order.create_time).format('YYYY-MM-DD'),
        ordertype: "GS",
        shipvia: "1",
        deladd1: order.recipient_address.full_address.substring(0, 253),
        deladd2: (address?.['sub-district'] ?? address?.district)?.substring(0, 40) ?? '',
        deladd3: (address?.city ?? address?.regency)?.substring(0, 40) ?? '',
        deladd4: address.province,
        deladd5: order.recipient_address.postal_code,
        deladd6: address.country,
        contactphone: order.recipient_address.phone_number,
        contactemail: order.buyer_email,
        deliverto: order.recipient_address.name,
        deliverblind: '1',
        freightcost: '0',
        fromstkloc: custBranch.defaultlocation,
        deliverydate: moment.unix(order.update_time).format('YYYY-MM-DD'),
        confirmeddate: moment.unix(order.update_time).format('YYYY-MM-DD'),
        printedpackingslip: '0',
        datepackingslipprinted: moment.unix(order.update_time).format('YYYY-MM-DD'),
        quotation: '0',
        quotedate: moment.unix(order.update_time).format('YYYY-MM-DD'),
        poplaced: '0',
        salesperson: custBranch.salesman,
        userid: 'marketplace',
        marketplace: "Tiktok",
        shop: shopId,
        executed: new Date(),
        migration: 0,
        payload: {
          debtorno: custBranch.debtorno,
          branchcode: custBranch.branchcode,
          customerref: order.id.substring(0, 50),
          buyername: order.buyer_email.substring(0, 50),
          comments: order.buyer_message,
          orddate: moment.unix(order.create_time).format('DD/MM/YYYY'),
          ordertype: "GS",
          shipvia: "1",
          deladd1: order.recipient_address.full_address.substring(0, 40),
          deladd2: (address?.['sub-district'] ?? address?.district)?.substring(0, 40) ?? '',
          deladd3: (address?.city ?? address?.regency)?.substring(0, 40) ?? '',
          deladd4: address.province.substring(0, 40),
          deladd5: order.recipient_address.postal_code.substring(0, 20),
          deladd6: address.country.substring(0, 15),
          contactphone: order.recipient_address.phone_number.substring(0, 25),
          contactemail: order.buyer_email.substring(0, 40),
          deliverto: order.recipient_address.name.substring(0, 40),
          deliverblind: '1',
          freightcost: 0,
          fromstkloc: custBranch.defaultlocation,
          deliverydate: moment.unix(order.update_time).format('DD/MM/YYYY'),
          confirmeddate: moment.unix(order.update_time).format('DD/MM/YYYY'),
          printedpackingslip: 0,
          datepackingslipprinted: moment.unix(order.update_time).format('DD/MM/YYYY'),
          quotation: 0,
          quotedate: moment.unix(order.update_time).format('DD/MM/YYYY'),
          poplaced: 0,
          salesperson: custBranch.salesman
        }
    }

    let insertSO = await salesorders.create(payloadSO);

    console.log( {insertSO:insertSO }); 

    order.line_items.map(async (element) => {
      let orderLineNo = uuidv4();

      let payloadSOD = {
          orderlineno: orderLineNo,
          orderno: "-",     
          koli:'',
          stkcode: element.sku_id,
          qtyinvoiced:'0',
          unitprice:+element.original_price + +element.platform_discount,
          quantity:'1',
          estimate:0,
          discountpercent:0,
          discountpercent2:0,
          actualdispatchdate: moment(new Date()).format('YYYY-MM-DD'),
          completed:'0',
          narrative:'',
          itemdue: moment(new Date()).format('YYYY-MM-DD'),
          poline:0,
          marketplace: "Tiktok",
          shop: shopId,
          customerref: order.id,
          executed: new Date(),
          migration: 0,
          payload:{
            orderno: "-",
            koli: '',
            stkcode: element.seller_sku,
            qtyinvoiced: 0,
            unitprice: +element.original_price + +element.platform_discount, //update dari item_price jadi paid_price 11/01/2024
            quantity: 1,
            estimate: 0,
            discountpercent: 0,
            discountpercent2: 0,
            actualdispatchdate: moment(new Date()).format('YYYY-MM-DD'),
            completed: 0,
            narrative: 'This is a comment.',
            itemdue: moment(new Date()).format('YYYY-MM-DD'),
            poline: '0',
          }
      }

      try {
          let insertSOD = await salesorderdetails.create(payloadSOD);
          console.log({ insertSOD: insertSOD });
      } catch (error) {
        console.error('Error while creating salesorderdetails:', error);
        // Handle the error appropriately, e.g., log it, return an error response, or perform any necessary actions.
      }
    })
    
    return;
  })

  const payloadReturn = { 
    success: 1,
    count: orders.length, 
    orderList: orders 
  }

  return payloadReturn;
}

exports.getOrderList = async (req, res) => {

  // Get current date
  const currentDate = moment();
  
  // Calculate yesterday's date
  const yesterdayDate = currentDate.clone().subtract(7, 'day');
  
  // Set the time to 00:00:00 for yesterday
  const fromTime = yesterdayDate.startOf('day').unix();

  // Calculate the end date (yesterday)
  const endDate = currentDate.clone().subtract(1, 'day');
  
  // Set the time to 23:59:59 for yesterday
  const toTime = endDate.endOf('day').unix();
  
  console.log('Unix timestamp for from_date (00:00):', fromTime);
  console.log('Unix timestamp for to_date (23:59):', toTime);
  
  const timestamp = Math.floor(moment().utc().valueOf() / 1000);
  // const timestamp = Math.floor(new Date() / 1000);

  const shopId = req.params.shopId

  // const tokenContent = await readFileAsync(shopId+'/token.txt');

  const debtOrsmaster = await debtorsmaster.findOne({
    raw: true,
    where: {
      idseller: shopId
    }
  })

  const custBranch = await custbranch.findOne({
    raw: true,
    where: {
      debtorno: debtOrsmaster?.debtorno ?? "831"
    }
  })

  const soTrx = await salesorders.findAll({
    where: {
      marketplace: "Tiktok",
      // migration: '1',
      // executed: {
      //   [Op.between]: [
      //     moment(moment.tz(jakartaTimezone)).subtract(7, 'days').set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toDate(),
      //     moment(moment.tz(jakartaTimezone)).toDate()
      //   ]
      // }
    }
  });

  const customerRefs = soTrx.map(order => order.customerref);

  console.log("customerRefs : ",customerRefs)

  const APP_KEY = debtOrsmaster.app_key;
  const APP_SECRET = debtOrsmaster.app_secret;
  const tokenContent = debtOrsmaster.token;

  // Example usage:
  const orderStatus = ['IN_TRANSIT', 'DELIVERED', 'COMPLETED']
  const path = '/order/202309/orders/search';
  // const shopCipher = 'ROW_c9_f1AAAAAAJtT-cuRVqJ1P4KZz8oLcP'
  let   pageToken = ''
  let   orders = []

  let shopCipher = await getShops(APP_KEY, APP_SECRET,tokenContent).then((resApi) => {
    console.log("RES API : ", resApi)
    if(resApi.code == 0 && resApi.data.shops.length){
      return resApi.data.shops[0].cipher;
    } else {
      return "-";
    }
  })

  if(shopCipher == "-") {
    console.log("Shop Cipher not Found")
    return response.res200(res, "001", "Get ShopList Failed", {})
  }

  // return response.res200(res, "000", "Get ShopList Success", { resApi: shopCipher })

  let orderList = await Promise.all(orderStatus.map(async (status) => {
    console.log({ status: status })

    let i = 1;

    while(1){
      console.log({ i: i})

      let data = {
        order_status: status,
        create_time_ge: fromTime,
        create_time_lt: toTime
      }

      let queries = {
          app_key: APP_KEY,
          page_size: 20,
          shop_cipher: shopCipher,
          timestamp: timestamp
      };

      if (pageToken != '') queries.page_token = pageToken;

      const signature = generateSHA256(path, queries, APP_SECRET, data);
      console.log(signature);

      let url = `https://open-api.tiktokglobalshop.com/order/202309/orders/search?app_key=${APP_KEY}&timestamp=${timestamp}&sign=${signature}&access_token=${tokenContent}&page_size=${queries.page_size}&shop_cipher=${shopCipher}`

      if (pageToken != '') url += `&page_token=${pageToken}`;

      // console.log({ url: url, queries: queries})

      let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: url,
          headers: {
              'Content-Type': 'application/json',
              'x-tts-access-token': tokenContent
          },
          data: data
      };

      console.log({ reqConfig: config })

      try {

        const uidLog = uuidv4();
      
        const reqGOLog = {
          uid: uidLog,
          payload: config,
          marketplace: 'Tiktok',
          shop_id: shopId,
          executed: new Date(),
          api: 'getOrders',
          phase: 'Request',
          id: uuidv4()
        }
      
        let insertReqGOLog = await log_marketplace.create(reqGOLog);
      
        console.log( {insertReqGOLog:insertReqGOLog });

        const response = await axios.request(config);
        console.log({ response: response.data.data })

        const resGOLog2 = {
          uid: uidLog,
          payload: response.data,
          marketplace: 'Tiktok',
          shop_id: shopId,
          executed: new Date(),
          api: 'getOrders',
          phase: 'Response',
          id: uuidv4()
        }
    
        let insertResGOLog2 = await log_marketplace.create(resGOLog2);
        console.log( {insertResGOLog2:insertResGOLog2 });
        
        if(!response.data.data.orders) return 0;
        if(response.data.data.next_page_token != '') {
          pageToken = response.data.data.next_page_token
          console.log("NEXT PAGE: "+pageToken)
        }
        else {
          pageToken = ''
          console.log("PAGE TOKEN KOSONG")
        }

        orders = [...orders, ...response.data.data.orders]
        // orders = response.data.data.orders

        // return response.data;
      } catch (error) {
        console.log(error);
        pageToken = ''
      }

      if(pageToken == '') break;
      ++i;
    }

    return orders;

    }));

  // Flatten the array of arrays into a single array
  orders = orderList.flat().filter(order => order !== 0);

  let filteredOrders = orders.filter(order => !customerRefs.includes(order.id.toString()));
  console.log({ filteredOrders: filteredOrders})

  filteredOrders.map(async(order) => {

    let orderNo = uuidv4();

    let address = {}

    const districtInfo = await order.recipient_address.district_info;
    districtInfo.forEach(item => {
      address[item.address_level_name.toLowerCase()] = item.address_name;
    });

    let payloadSO = {
        orderno: orderNo,
        debtorno: custBranch.debtorno,
        branchcode: custBranch.branchcode,
        customerref: order.id,
        buyername: order.buyer_email,
        comments: order.buyer_message,
        orddate: moment.unix(order.create_time).format('YYYY-MM-DD'),
        ordertype: "GS",
        shipvia: "1",
        deladd1: order.recipient_address.full_address.substring(0, 253),
        deladd2: (address?.['sub-district'] ?? address?.district)?.substring(0, 40) ?? '',
        deladd3: (address?.city ?? address?.regency)?.substring(0, 40) ?? '',
        deladd4: address.province,
        deladd5: order.recipient_address.postal_code,
        deladd6: address.country,
        contactphone: order.recipient_address.phone_number,
        contactemail: order.buyer_email,
        deliverto: order.recipient_address.name,
        deliverblind: '1',
        freightcost: '0',
        fromstkloc: custBranch.defaultlocation,
        deliverydate: moment.unix(order?.update_time).format('YYYY-MM-DD'),
        confirmeddate: moment.unix(order?.update_time).format('YYYY-MM-DD'),
        printedpackingslip: '0',
        datepackingslipprinted: moment.unix(order?.update_time).format('YYYY-MM-DD'),
        quotation: '0',
        quotedate: moment.unix(order?.update_time).format('YYYY-MM-DD'),
        poplaced: '0',
        salesperson: custBranch.salesman,
        userid: 'marketplace',
        marketplace: "Tiktok",
        shop: shopId,
        executed: new Date(),
        migration: 0,
        payload: {
          debtorno: custBranch.debtorno,
          branchcode: custBranch.branchcode,
          customerref: order.id.substring(0, 50),
          buyername: order.buyer_email.substring(0, 50),
          comments: order.buyer_message,
          orddate: moment.unix(order.create_time).format('DD/MM/YYYY'),
          ordertype: "GS",
          shipvia: "1",
          deladd1: order.recipient_address.full_address.substring(0, 40),
          deladd2: (address?.['sub-district'] ?? address?.district)?.substring(0, 40) ?? '',
          deladd3: (address?.city ?? address?.regency)?.substring(0, 40) ?? '',
          deladd4: address.province.substring(0, 40),
          deladd5: order.recipient_address.postal_code.substring(0, 20),
          deladd6: address.country.substring(0, 15),
          contactphone: order.recipient_address.phone_number.substring(0, 25),
          contactemail: order.buyer_email.substring(0, 40),
          deliverto: order.recipient_address.name.substring(0, 40),
          deliverblind: '1',
          freightcost: 0,
          fromstkloc: custBranch.defaultlocation,
          deliverydate: moment.unix(order.update_time).format('DD/MM/YYYY'),
          confirmeddate: moment.unix(order.update_time).format('DD/MM/YYYY'),
          printedpackingslip: 0,
          datepackingslipprinted: moment.unix(order.update_time).format('DD/MM/YYYY'),
          quotation: 0,
          quotedate: moment.unix(order.update_time).format('DD/MM/YYYY'),
          poplaced: 0,
          salesperson: custBranch.salesman
        }
    }

    let insertSO = await salesorders.create(payloadSO);

    console.log( {insertSO:insertSO }); 

    order.line_items.map(async (element) => {
      let orderLineNo = uuidv4();

      let payloadSOD = {
          orderlineno: orderLineNo,
          orderno: "-",     
          koli:'',
          stkcode: element.sku_id,
          qtyinvoiced:'0',
          unitprice:+element.original_price + +element.platform_discount,
          quantity:'1',
          estimate:0,
          discountpercent:0,
          discountpercent2:0,
          actualdispatchdate: moment(new Date()).format('YYYY-MM-DD'),
          completed:'0',
          narrative:'',
          itemdue: moment(new Date()).format('YYYY-MM-DD'),
          poline:0,
          marketplace: "Tiktok",
          shop: shopId,
          customerref: order.id,
          executed: new Date(),
          migration: 0,
          payload:{
            orderno: "-",
            koli: '',
            stkcode: element.seller_sku,
            qtyinvoiced: 0,
            unitprice: +element.original_price + +element.platform_discount, //update dari item_price jadi paid_price 11/01/2024
            quantity: 1,
            estimate: 0,
            discountpercent: 0,
            discountpercent2: 0,
            actualdispatchdate: moment(new Date()).format('YYYY-MM-DD'),
            completed: 0,
            narrative: 'This is a comment.',
            itemdue: moment(new Date()).format('YYYY-MM-DD'),
            poline: '0',
          }
      }

      try {
          let insertSOD = await salesorderdetails.create(payloadSOD);
          console.log({ insertSOD: insertSOD });
      } catch (error) {
        console.error('Error while creating salesorderdetails:', error);
        // Handle the error appropriately, e.g., log it, return an error response, or perform any necessary actions.
      }
    })
    
    return;
  })

  return response.res200(res, "000", "Order List Success", { count: orders.length, orderList: orders })
}

exports.getOrderListOld = async (req, res) => {

  // const tokenContent = await readFileAsync('token.txt');

  // Get current date
  const currentDate = moment();
  
  // Calculate yesterday's date
  const yesterdayDate = currentDate.clone().subtract(7, 'day');
  
  // Set the time to 00:00:00 for yesterday
  const fromTime = yesterdayDate.startOf('day').unix();

  // Calculate the end date (yesterday)
  const endDate = currentDate.clone().subtract(1, 'day');
  
  // Set the time to 23:59:59 for yesterday
  const toTime = endDate.endOf('day').unix();
  
  console.log('Unix timestamp for from_date (00:00):', fromTime);
  console.log('Unix timestamp for to_date (23:59):', toTime);

  const timestamp = Math.floor(new Date().getTime() / 1000);

  const APP_KEY = '68hu8siqkegus'
  const APP_SECRET = '79236fdf1368a7e8a9ad5f4fee19fb776b9a5cc6'
  const tokenContent = 'ROW_huwdFAAAAAAjFB4j-EBRa-DWF8_aUzsPbS59jH8gbuOhmskKUDbvGYvPRK-WfKF5y_LyINhlbJRUuMsphWlmYnF99g99W-h0ESK1R0KxWGntg1qziUIP0SBcP66uMgu9wQlHLXllojPNB24pfVRjSBGMyTUydGvePQwB1vWEUkrgnFqVvqmFXQ'

  // Example usage:
  const path = '/api/orders/search';
  const queries = {
      app_key: APP_KEY,
      timestamp: timestamp
      // shop_id: '7494788030367500996'
  };

  const signature = generateSHA256(path, queries, APP_SECRET);
  console.log(signature);

  let data = {
    page_size: 3,
    create_time_ge: fromTime,
    create_time_lt: toTime
  }

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://open-api.tiktokglobalshop.com/api/orders/search?app_key=${APP_KEY}&access_token=${tokenContent}&timestamp=${timestamp}&sign=${signature}`,
    // url: `https://open-api.tiktokglobalshop.com/api/orders/search?app_key=${queries.app_key}&access_token=${access_token}&shop_id=${queries.shop_id}&timestamp=${queries.timestamp}&sign=${signature}`,
    headers: { 
      'Content-Type': 'application/json',
      'x-tts-access-token': 'ROW_huwdFAAAAAAjFB4j-EBRa-DWF8_aUzsPbS59jH8gbuOhmskKUDbvGYvPRK-WfKF5y_LyINhlbJRUuMsphWlmYnF99g99W-h0ESK1R0KxWGntg1qziUIP0SBcP66uMgu9wQlHLXllojPNB24pfVRjSBGMyTUydGvePQwB1vWEUkrgnFqVvqmFXQ',
      'shop_cipher': 'ROW_c9_f1AAAAAAJtT-cuRVqJ1P4KZz8oLcP'
    },
    data : data
  };

  console.log({ reqConfig: config})

  const orderList = await axios.request(config)
  .then((resApi) => {
    return resApi.data
  })
  .catch((error) => {
    console.log(error);
  });

  return response.res200(res, "000", "Order List Success", { orderList: orderList })
}

exports.getToken = async (req, res) => {

  const shopId = req.params.shopId

  console.log({ shopId: shopId});

  const debtOrsmaster = await debtorsmaster.findOne({
    raw: true,
    where: {
      idseller: shopId
    }
  })

  const APP_KEY = debtOrsmaster.app_key
  const APP_SECRET = debtOrsmaster.app_secret
  const AUTH_CODE = debtOrsmaster.auth_code

  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://auth.tiktok-shops.com/api/v2/token/get?app_key='+APP_KEY+'&auth_code='+AUTH_CODE+'&app_secret='+APP_SECRET+'&grant_type=authorized_code',
    headers: { }
  };
  
  let getToken = await axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));

    return response.data;
  })
  .catch((error) => {
    console.log(error);
  });
  
  const updateToken = await debtorsmaster.update(
    {
      token: getToken.data.access_token,
      refresh_token: getToken.data.refresh_token
    },
    {
      where: {
        idseller: shopId
      }
    })

  console.log({ updateToken: updateToken })

  return response.res200(res, "000", "Success", { config: config, getToken: getToken })
}

exports.refreshToken = async (req, res) => {
  const shopId = req.params.shopId

  console.log({ shopId: shopId});

  const debtOrsmaster = await debtorsmaster.findOne({
    raw: true,
    where: {
      idseller: shopId
    }
  })

  const APP_KEY = debtOrsmaster.app_key
  const APP_SECRET = debtOrsmaster.app_secret
  const refreshTokenContent = debtOrsmaster.refresh_token

  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://auth.tiktok-shops.com/api/v2/token/refresh?app_key='+APP_KEY+'&refresh_token='+refreshTokenContent+'&app_secret='+APP_SECRET+'&grant_type=refresh_token',
    headers: { }
  };

  console.log({ req: config})
  
  const refreshToken = await axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));

    return response.data;
  })
  .catch((error) => {
    console.log(error);
  });
  
  const updateToken = await debtorsmaster.update(
    {
      token: refreshToken.data.access_token,
      refresh_token: refreshToken.data.refresh_token
    },
    {
      where: {
        idseller: shopId
      }
    })

  console.log({ updateToken: updateToken })

  return response.res200(res, "000", "Success", { req: config, refreshToken: refreshToken })
}