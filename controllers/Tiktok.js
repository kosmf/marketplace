const axios = require('axios');
const response = require("@Components/response")
const { salesorderdetails, salesorders } = require("@Configs/database")
const moment = require('moment');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { APP_KEY_TIKTOK, APP_SECRET_TIKTOK, AUTH_CODE_TIKTOK } = process.env

const baseDirectory = path.join(__dirname, '../token/tiktok'); // Define the absolute directory path

const generateCustomLengthString = (length) => {
  if (length <= 0) {
      throw new Error('Length must be a positive integer');
  }

  const characters = '0123456789';
  // const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
  }

  return result;
}

async function writeFileAsync(fileName, content) {

const filePath = path.join(baseDirectory, fileName); // Combine the directory path with the file name

try {
  // Create the directory if it doesn't exist
  await fs.mkdir(baseDirectory, { recursive: true });

  await fs.writeFile(filePath, content);
  console.log('Token Lazada has been written successfully.');
} catch (err) {
  console.error('Error writing to file:', err);
}
}

async function readFileAsync(fileName) {
  const filePath = path.join(baseDirectory, fileName); // Use the absolute file path

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    console.log(`Contents of ${fileName}:`);
    console.log(fileContent);

    // Return the file content
    return fileContent;
  } catch (err) {
    console.error(`Error reading ${fileName}:`, err);
    return null; // Return null in case of an error
  }
}

/**
 * Generate SHA-256 signature.
 * @param {string} path - API path, for example, "/api/orders".
 * @param {Object} queries - Extract all query params EXCEPT 'sign' and 'access_token'.
 * @param {string} secret - App secret.
 * @returns {string} - SHA-256 signature.
 */
function generateSHA256(path, queries, secret) {
    // Reorder the params based on alphabetical order.
    const keys = Object.keys(queries).sort();

    // Concatenate all the params in the format of {key}{value} and append the request path to the beginning.
    let input = path;
    keys.forEach((key) => {
        input += key + queries[key];
    });

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

exports.getOrderList2 = async (req, res) => {

  const tokenContent = await readFileAsync('token.txt');

  // Get current date
  const currentDate = moment();
  
  // Calculate yesterday's date
  const yesterdayDate = currentDate.clone().subtract(1, 'day');
  
  // Set the time to 00:00:00 for yesterday
  const fromTime = yesterdayDate.startOf('day').unix();
  
  // Set the time to 23:59:59 for yesterday
  const toTime = yesterdayDate.endOf('day').unix();
  
  console.log('Unix timestamp for from_date (00:00):', fromTime);
  console.log('Unix timestamp for to_date (23:59):', toTime);

  const timestamp = Math.floor(new Date().getTime() / 1000);

  // Example usage:
  const path = '/api/orders/search';
  const queries = {
      app_key: APP_KEY_TIKTOK,
      timestamp: timestamp
      // shop_id: '7494788030367500996'
  };

  const signature = generateSHA256(path, queries, APP_SECRET_TIKTOK);
  console.log(signature);

  let data = {
    page_size: 99,
    create_time_from: fromTime,
    create_time_to: toTime
  }

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://open-api.tiktokglobalshop.com/api/orders/search?app_key=${queries.app_key}&access_token=${tokenContent}&timestamp=${queries.timestamp}&sign=${signature}`,
    // url: `https://open-api.tiktokglobalshop.com/api/orders/search?app_key=${queries.app_key}&access_token=${access_token}&shop_id=${queries.shop_id}&timestamp=${queries.timestamp}&sign=${signature}`,
    headers: { 
      'Content-Type': 'application/json'
    },
    data : data
  };

  console.log({ reqConfig: config})

  return await axios.request(config)
  .then((resApi) => {
    console.log(JSON.stringify(resApi.data));

    response.res200(res, "000", "OrderList Success", { fromTime:fromTime, toTime: toTime, response: resApi.data })
  })
  .catch((error) => {
    console.log(error);
  });

}


exports.getOrderList = async (req, res) => {

  const tokenContent = await readFileAsync('token.txt');

  // Get current date
  const currentDate = moment();
  
  // Calculate yesterday's date
  const yesterdayDate = currentDate.clone().subtract(1, 'day');
  
  // Set the time to 00:00:00 for yesterday
  const fromTime = yesterdayDate.startOf('day').unix();
  
  // Set the time to 23:59:59 for yesterday
  const toTime = yesterdayDate.endOf('day').unix();
  
  console.log('Unix timestamp for from_date (00:00):', fromTime);
  console.log('Unix timestamp for to_date (23:59):', toTime);

  const timestamp = Math.floor(new Date().getTime() / 1000);

  // Example usage:
  const path = '/api/orders/search';
  const queries = {
      app_key: APP_KEY_TIKTOK,
      timestamp: timestamp
      // shop_id: '7494788030367500996'
  };

  const signature = generateSHA256(path, queries, APP_SECRET_TIKTOK);
  console.log(signature);

  let data = {
    page_size: 99,
    create_time_from: fromTime,
    create_time_to: toTime
  }

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://open-api.tiktokglobalshop.com/api/orders/search?app_key=${queries.app_key}&access_token=${tokenContent}&timestamp=${queries.timestamp}&sign=${signature}`,
    // url: `https://open-api.tiktokglobalshop.com/api/orders/search?app_key=${queries.app_key}&access_token=${access_token}&shop_id=${queries.shop_id}&timestamp=${queries.timestamp}&sign=${signature}`,
    headers: { 
      'Content-Type': 'application/json'
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

  // Example usage:
  const timestamp2 = Math.floor(new Date().getTime() / 1000);
  const path2 = '/api/orders/detail/query';
  const queries2 = {
      app_key: APP_KEY_TIKTOK,
      timestamp: timestamp2
      // shop_id: '7494788030367500996'
  };

  const signature2 = generateSHA256(path2, queries2, APP_SECRET_TIKTOK);
  console.log(signature2);

  let orderListID = orderList.data.order_list.map(item => item.order_id);

  let data2 = {
    order_id_list: orderListID
  }

  let config2 = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://open-api.tiktokglobalshop.com/api/orders/detail/query?app_key=${queries2.app_key}&access_token=${tokenContent}&timestamp=${queries2.timestamp}&sign=${signature2}`,
    // url: `https://open-api.tiktokglobalshop.com/api/orders/search?app_key=${queries.app_key}&access_token=${access_token}&shop_id=${queries.shop_id}&timestamp=${queries.timestamp}&sign=${signature}`,
    headers: { 
      'Content-Type': 'application/json'
    },
    data : data2
  };

  console.log({ reqConfig: config2})

  const ordersDetail = await axios.request(config2)
  .then((resApi) => {
    console.log(JSON.stringify(resApi.data));
    return resApi.data;
  })
  .catch((error) => {
    console.log(error);
  });

  ordersDetail.data.order_list.map(async(element) => {
    let orderNo = element.order_id

    const createtime = moment(element.create_time * 1000);
    const date = moment(element.update_time * 1000);

    // Format the date as "YYYY-MM-DD"
    const formattedDate = date.format('YYYY-MM-DD');
    
    let payloadSO = {
        orderno: orderNo,
        debtorno: '368',
        branchcode: '368',
        customerref: element.order_id,
        buyername: element.buyer_uid,
        comments: element.buyer_message,
        orddate: createtime,
        ordertype: "GS",
        shipvia: "1",
        deladd1: element.recipient_address.address_detail,
        deladd2: element.recipient_address.district,
        deladd3: element.recipient_address.city,
        deladd4: element.recipient_address.state,
        deladd5: (element.recipient_address.post_code != null) ? element.recipient_address.post_code : "11111",
        deladd6: element.recipient_address.region,
        contactphone: element.recipient_address.phone,
        contactemail: element.buyer_email,
        deliverto: element.recipient_address.name,
        deliverblind: '2',
        freightcost: '0',
        fromstkloc: 'PST',
        deliverydate: formattedDate,
        confirmeddate:formattedDate,
        printedpackingslip: '1',
        datepackingslipprinted: formattedDate,
        quotation: '0',
        quotedate:  createtime,
        poplaced: '0',
        salesperson: 'P21',
        userid: 'nurul'
    }

    let insertSO = await salesorders.create(payloadSO);

    console.log( {insertSO:insertSO }); 

    let i = 1;
      
    element.item_list.map(async(product) => {
        console.log(product)

        let payloadSOD = {
            orderlineno: generateCustomLengthString(4),
            orderno: orderNo,     
            koli:'',
            stkcode: product.sku_id,
            qtyinvoiced:'1',
            unitprice:product.sku_sale_price,
            quantity:product.quantity,
            estimate:0,
            // discountpercent:((+product.sku_platform_discount_total + +product.sku_seller_discount)/(+product.price*+product.quantity))*100,
            discountpercent:0,
            discountpercent2:0,
            actualdispatchdate: formattedDate,
            completed:'0',
            narrative:'',
            itemdue: formattedDate,
            poline:0,
    
        }
    
        let insertSOD = await salesorderdetails.create(payloadSOD);

        console.log( {insertSOD:insertSOD })
        i++;
    })
  })

  response.res200(res, "000", "OrderDetail Success", { orderList: orderList, ordersDetail: ordersDetail })
}

exports.getOrderDetail2 = async (req, res) => {

  const tokenContent = await readFileAsync('token.txt');

  // Get current date
  const currentDate = moment();
  
  // Calculate yesterday's date
  const yesterdayDate = currentDate.clone().subtract(1, 'day');
  
  // Set the time to 00:00:00 for yesterday
  const fromTime = yesterdayDate.startOf('day').unix();
  
  // Set the time to 23:59:59 for yesterday
  const toTime = yesterdayDate.endOf('day').unix();
  
  console.log('Unix timestamp for from_date (00:00):', fromTime);
  console.log('Unix timestamp for to_date (23:59):', toTime);

  const timestamp = Math.floor(new Date().getTime() / 1000);

  // Example usage:
  const path = '/api/orders/detail/query';
  const queries = {
      app_key: APP_KEY_TIKTOK,
      timestamp: timestamp
      // shop_id: '7494788030367500996'
  };
 
  const signature = generateSHA256(path, queries, APP_SECRET_TIKTOK);
  console.log(signature);

  let data = {
    order_id_list: ["577850723701066511","577850634888186430"]
  }

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://open-api.tiktokglobalshop.com/api/orders/detail/query?app_key=${queries.app_key}&access_token=${tokenContent}&timestamp=${queries.timestamp}&sign=${signature}`,
    // url: `https://open-api.tiktokglobalshop.com/api/orders/search?app_key=${queries.app_key}&access_token=${access_token}&shop_id=${queries.shop_id}&timestamp=${queries.timestamp}&sign=${signature}`,
    headers: { 
      'Content-Type': 'application/json'
    },
    data : data
  };

  console.log({ reqConfig: config})

  return await axios.request(config)
  .then((resApi) => {
    console.log(JSON.stringify(resApi.data));

    response.res200(res, "000", "OrderDetail Success", { fromTime:fromTime, toTime: toTime, response: resApi.data })
  })
  .catch((error) => {
    console.log(error);
  });


  

}

exports.getToken = async (req, res) => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://auth.tiktok-shops.com/api/v2/token/get?app_key='+APP_KEY_TIKTOK+'&auth_code='+AUTH_CODE_TIKTOK+'&app_secret='+APP_SECRET_TIKTOK+'&grant_type=authorized_code',
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
  
  writeFileAsync('token.txt', getToken.data.access_token);
  writeFileAsync('refresh_token.txt', getToken.data.refresh_token);

  return response.res200(res, "000", "Success", { getToken: getToken })
}

exports.refreshToken = async (req, res) => {
  const refreshTokenContent = await readFileAsync('refresh_token.txt');

  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://auth.tiktok-shops.com/api/v2/token/refresh?app_key='+APP_KEY_TIKTOK+'&refresh_token='+refreshTokenContent+'&app_secret='+APP_SECRET_TIKTOK+'&grant_type=refresh_token',
    headers: { }
  };
  
  const refreshToken = await axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));

    return response.data;
  })
  .catch((error) => {
    console.log(error);
  });
  
  writeFileAsync('token.txt', refreshToken.access_token);
  writeFileAsync('refresh_token.txt', refreshToken.refresh_token);

  return response.res200(res, "000", "Success", { refreshToken: refreshToken })
}