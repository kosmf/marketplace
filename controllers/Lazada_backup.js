const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const response = require("@Components/response")
const { salesorderdetails, salesorders } = require("@Configs/database")
const crypto = require('crypto');
const LazadaAPI = require('lazada-open-platform-sdk')
const { APP_KEY_LAZADA, APP_SECRET_LAZADA, REGION_LAZADA, AUTH_CODE_LAZADA } = process.env
const moment = require('moment-timezone');

const baseDirectory = path.join(__dirname, '../token/lazada'); // Define the absolute directory path
const aLazadaAPI = new LazadaAPI(APP_KEY_LAZADA, APP_SECRET_LAZADA, REGION_LAZADA)

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


exports.callback = async(req, res) => {
    console.log({ reqCallbackHeaders : req.headers })
    console.log({ reqCallback : req.body })

    return response.res200(res, "000", "Success", { callback: req.body })
}

exports.getToken = async (req, res) => {
    const getToken = await aLazadaAPI
    .generateAccessToken({ code: AUTH_CODE_LAZADA })
    .then(response => {
        console.log({ response: response})
        const { access_token } = response // JSON data from Lazada's API
        return response;
    })

    
    writeFileAsync('token.txt', getToken.access_token);
    writeFileAsync('refresh_token.txt', getToken.refresh_token);

    return response.res200(res, "000", "Success", { getToken: getToken })
}

exports.refreshToken = async (req, res) => {
    const refreshTokenContent = await readFileAsync('refresh_token.txt');

    console.log({ refreshTokenContent: refreshTokenContent})

    const refreshToken = await aLazadaAPI.refreshAccessToken({ refresh_token: refreshTokenContent });

    writeFileAsync('token.txt', refreshToken.access_token);
    writeFileAsync('refresh_token.txt', refreshToken.refresh_token);

    return response.res200(res, "000", "Success", { refreshToken: refreshToken })
}

exports.getOrderList = async (req, res) => {

    const tokenContent = await readFileAsync('token.txt');

    const jakartaTimezone = 'Asia/Jakarta';
    const now = moment.tz(jakartaTimezone);

    // Subtract one day to get yesterday
    const yesterday = now.subtract(1, 'days');

    // Set the time to 00:00:00
    yesterday.startOf('day');

    // Format the timestamp in the desired format
    const formattedTimestamp = yesterday.format('YYYY-MM-DDTHH:mm:ssZ');
        
    console.log('formattedTimestamp : '+formattedTimestamp);

    const listOrders = await aLazadaAPI.getOrders({ access_token: tokenContent, created_after: formattedTimestamp })
    .then((resApi) => {
        console.log({ resApi: resApi})
        return resApi
    })
    .catch((err) => console.log(err))
    
    const orders = listOrders.data.orders;
    const orderIds = orders.map(order => order.order_id);

    console.log(orderIds)
    // Convert the array of order IDs to a string format "[order_id, order_id, ...]"
    const formattedOrderIds = "[" + orderIds.join() + "]";
    console.log(formattedOrderIds)

    const listOrderItems = await aLazadaAPI.getMultipleOrderItems({ access_token: tokenContent, order_ids: formattedOrderIds })
    .then((resApi) => {
        console.log({ resApi: resApi})
        return resApi
    })
    .catch((err) => console.log(err))

    // orders.map(async(element) => {

    //     let orderNo = generateCustomLengthString(3)+element.order_id
    
    //     let payloadSO = {
    //         orderno: orderNo,
    //         debtorno: '368',
    //         branchcode: '368',
    //         customerref: element.order_number,
    //         buyername: element.address_billing.first_name,
    //         comments: element.remarks,
    //         orddate: element.created_at.split(" ")[0],
    //         ordertype: "GS",
    //         shipvia: "1",
    //         deladd1: element.address_shipping.address1,
    //         deladd2: element.address_shipping.address3,
    //         deladd3: element.address_shipping.address4,
    //         deladd4: element.address_shipping.address5,
    //         deladd5: element.address_shipping.post_code,
    //         deladd6: element.address_shipping.country,
    //         contactphone: element.address_shipping.phone,
    //         contactemail: '',
    //         deliverto: element.address_shipping.first_name,
    //         deliverblind: '2',
    //         freightcost: '0',
    //         fromstkloc: 'PST',
    //         deliverydate: element.updated_at.split(" ")[0],
    //         confirmeddate:element.updated_at.split(" ")[0],
    //         printedpackingslip: '1',
    //         datepackingslipprinted: element.updated_at.split(" ")[0],
    //         quotation: '0',
    //         quotedate:  element.updated_at.split(" ")[0],
    //         poplaced: '0',
    //         salesperson: 'P21',
    //         userid: 'nurul'
    //     }

    //     let insertSO = await salesorders.create(payloadSO);

    //     console.log( {insertSO:insertSO }); 
    // });

    // listOrderItems.data.map(async (order) => {

    //     order.order_items.map(async (element) => {
    //         console.log(element)

    //         let payloadSOD = {
    //             orderlineno: generateCustomLengthString(4),
    //             orderno: order.order_number,     
    //             koli:'',
    //             stkcode: element.sku_id,
    //             qtyinvoiced:'1',
    //             unitprice:element.item_price,
    //             quantity:'1',
    //             estimate:0,
    //             discountpercent:0,
    //             discountpercent2:0,
    //             actualdispatchdate:element.created_at,
    //             completed:'0',
    //             narrative:'',
    //             itemdue: element.created_at.split(" ")[0],
    //             poline:0
    //         }

    //         let insertSOD = await salesorderdetails.create(payloadSOD);

    //         console.log( {insertSOD:insertSOD })
    //     })
    // });

    console.log({ listOrderItems : listOrderItems})
        
    return response.res200(res, "000", "Success", {listOrderItems: listOrderItems })

}