const axios = require('axios');
const crypto = require('crypto');
const response = require("@Components/response")
const { salesorderdetails, salesorders, debtorsmaster, custbranch, log_marketplace, log_rpc } = require("@Configs/database")
const moment = require('moment');
const fs = require('fs').promises;
const xml_rpc = require("@Controllers/xml-rpc-method")
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { FS_ID, SHOP_ID, SHOPEE_CODE } = process.env
const { Op } = require("sequelize");

const host = 'https://partner.shopeemobile.com';
const partnerId = 2006477;
const partnerKey = '644c6d6f4675576c646f7079616f51655052757643484a7876636c437a707552';
// const shopId = 308454744;
// const shopId = 201093353;
// const shopId = 291418593;
// const shopId = 1032355345;
// const shopId2 = 1087585903;
// const shopId = 1030098836;
const merchantId = 1234567;

const baseDirectory = path.join(__dirname, '../token/shopee'); // Define the absolute directory path

async function writeFileAsync(fileName, content) {

  const filePath = path.join(baseDirectory, fileName); // Combine the directory path with the file name

  try {
    // Create the directory if it doesn't exist
    await fs.mkdir(baseDirectory, { recursive: true });

    await fs.writeFile(filePath, content);
    console.log('Token Shopee has been written successfully.');
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

const generateSign = (baseString) => {
  return crypto
  .createHmac('sha256', partnerKey)
  .update(baseString)
  .digest('hex');
}

// Function to get Token
exports.getToken = async (req, res) => {

  const shopId = +req.params.shopId
  const authCode = req.params.authCode

  console.log({ shopId: shopId, authCode: authCode });

  const path = '/api/v2/auth/token/get';
  const timest = Math.floor(Date.now() / 1000);

  // const body = {
  //   code: SHOPEE_CODE,
  //   shop_id: shopId,
  //   partner_id: partnerId,
  // };

  const body = {
    code: authCode,
    shop_id: shopId,
    partner_id: partnerId,
  };

  const baseString = `${partnerId}${path}${timest}`;
  const sign = crypto
    .createHmac('sha256', partnerKey)
    .update(baseString)
    .digest('hex');

  const url = `${host}${path}?partner_id=${partnerId}&timestamp=${timest}&sign=${sign}`;

  const headers = {
    'Content-Type': 'application/json',
  };  

  try {
    const resApi = await axios.post(url, body, { headers });

    const data = resApi.data; 
    res.locals.tokenShopee = data
    console.log('raw result:', data);
    const accessToken = data.access_token;
    const newRefreshToken = data.refresh_token;
    console.log(`access_token: ${accessToken}, refresh_token: ${newRefreshToken}, raw: ${JSON.stringify(data)}`);

    writeFileAsync(shopId+'/token.txt', data.access_token);
    writeFileAsync(shopId+'/refresh_token.txt', data.refresh_token);

    return response.res200(res, "000", "GET TOKEN SUCCESS", data);

  } catch (error) {

    console.log(error.config);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);

      return response.res200(res, "001", "GET TOKEN FAILED", { error: error.response.data });
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
      return response.res200(res, "001", "GET TOKEN FAILED", { error: error.request });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
      return response.res200(res, "001", "GET TOKEN FAILED", { error: error.message });
    }
  }
}

// Function refresh Token
exports.refreshToken = async (req, res) => {

  const shopId = +req.params.shopId

  console.log({ shopId: shopId});

  const refreshTokenContent = await readFileAsync(shopId+'/refresh_token.txt');

  const path = '/api/v2/auth/access_token/get';
  const timest = Math.floor(Date.now() / 1000);

  const body = {
    refresh_token: refreshTokenContent,
    shop_id: shopId,
    partner_id: partnerId,
  };

  const baseString = `${partnerId}${path}${timest}`;
  const sign = crypto
    .createHmac('sha256', partnerKey)
    .update(baseString)
    .digest('hex');

  const url = `${host}${path}?partner_id=${partnerId}&timestamp=${timest}&sign=${sign}`;

  const headers = {
    'Content-Type': 'application/json',
  };  

  try {
    const resApi = await axios.post(url, body, { headers });

    const data = resApi.data; 
    console.log('raw result:', data);
    res.locals.tokenShopee = data
    const accessToken = data.access_token;
    const newRefreshToken = data.refresh_token;
    console.log(`access_token: ${accessToken}, refresh_token: ${newRefreshToken}, raw: ${JSON.stringify(data)}`);

    writeFileAsync(shopId+'/token.txt', data.access_token);
    writeFileAsync(shopId+'/refresh_token.txt', data.refresh_token);

    return response.res200(res, "000", "GET TOKEN SUCCESS", data);

  } catch (error) {

    console.log(error.config);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);

      return response.res200(res, "001", "GET TOKEN FAILED", { error: error.response.data });
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
      return response.res200(res, "001", "GET TOKEN FAILED", { error: error.request });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
      return response.res200(res, "001", "GET TOKEN FAILED", { error: error.message });
    }
  }
}

exports.getOrderList = async (req, res) => {

  const shopId = +req.params.shopId

  console.log({ shopId: shopId});

  const tokenAccess = await readFileAsync(shopId+'/token.txt');

  let orderList = []

  const jakartaTimezone = 'Asia/Jakarta';

  // Get current date
  const currentDate = moment();
  
  // Calculate yesterday's date
  const yesterdayDate = currentDate.clone().subtract(7, 'day');
  
  // Set the time to 00:00:00 for yesterday
  const fromTime = yesterdayDate.startOf('day').unix();
  
  // Set the time to 23:59:59 for yesterday
  const toTime = yesterdayDate.endOf('day').unix();

  const timestamp = Math.floor(Date.now() / 1000)
  const time_range_field = 'create_time'
  
  console.log('moment : '+currentDate);
  console.log('Unix timestamp for from_date (00:00):', fromTime);
  console.log('Unix timestamp for to_date (23:59):', toTime);

  const debtOrsmaster = await debtorsmaster.findOne({
    raw: true,
    where: {
      idseller: shopId.toString()
    }
  })

  const custBranch = await custbranch.findOne({
    raw: true,
    where: {
      debtorno: debtOrsmaster?.debtorno ?? "832"
    }
  })

  const soTrx = await salesorders.findAll({
    where: {
      marketplace: "Shopee",
      migration: '1',
      executed: {
        [Op.between]: [
          moment(moment.tz(jakartaTimezone)).subtract(7, 'days').set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toDate(),
          moment(moment.tz(jakartaTimezone)).toDate()
        ]
      }
    }
  });

  const customerRefs = soTrx.map(order => order.customerref);

  console.log("customerRefs : ",customerRefs)

  // return response.res200(res, "000", "Success", {customerRefs: customerRefs, custBranch: custBranch, tokenAccess: tokenAccess })

  // Call public API
  const publicPath = '/api/v2/order/get_order_list';
  const publicParams = `&shop_id=${shopId}&time_range_field=${time_range_field}&time_from=${fromTime}&time_to=${toTime}&page_size=${20}&order_status=SHIPPED`;

  console.log('public params: '+publicParams)

  const baseString = `${partnerId}${publicPath}${timestamp}${tokenAccess}${shopId}`;
  
  const sign = generateSign(baseString);

  const url = `${host}${publicPath}?partner_id=${partnerId}&sign=${sign}&timestamp=${timestamp}&access_token=${tokenAccess}${publicParams}`;

  const uidLog = uuidv4();

  const reqGOLog = {
    uid: uidLog,
    payload: { urlGet: url },
    marketplace: 'Shopee',
    shop_id: shopId,
    executed: new Date(),
    api: publicPath,
    phase: 'Request',
    id: uuidv4()
  }

  let insertReqGOLog = await log_marketplace.create(reqGOLog);

  // console.log( {insertReqGOLog:insertReqGOLog }); 

  return await axios.get(url).then(async ({ data: responseApi}) => {
    // console.log({ response: responseApi})

    const resGOLog = {
      uid: uidLog,
      payload: responseApi,
      marketplace: 'Shopee',
      shop_id: shopId,
      executed: new Date(),
      api: publicPath,
      phase: 'Response',
      id: uuidv4()
    }
  
    let insertResGOLog = await log_marketplace.create(resGOLog);
  
    // console.log( {insertResGOLog:insertResGOLog }); 

    orderList.push(...responseApi.response.order_list);

    // console.log({ arrayLength: orderList.length, orderList: orderList})

    let cursor = responseApi.response.next_cursor;

    while (responseApi.response.more){
      let nextParams = publicParams+'&cursor='+cursor
      let nextUrl = `${host}${publicPath}?partner_id=${partnerId}&sign=${sign}&timestamp=${timestamp}&access_token=${tokenAccess}${nextParams}`;

      let reqGOLogNext = {
        uid: uidLog,
        payload: { urlGet: nextUrl },
        marketplace: 'Shopee',
        shop_id: shopId,
        executed: new Date(),
        api: nextParams,
        phase: 'Request',
        id: uuidv4()
      }
    
      let insertReqGOLogNext = await log_marketplace.create(reqGOLogNext);
    
      // console.log( {insertReqGOLogNext:insertReqGOLogNext }); 

      let nextCursor = await axios.get(nextUrl).then(async ({ data: responseNext}) => {
        console.log({ nextPage: responseNext})

        let resGOLogNext = {
          uid: uidLog,
          payload: responseNext,
          marketplace: 'Shopee',
          shop_id: shopId,
          executed: new Date(),
          api: publicPath,
          phase: 'Response',
          id: uuidv4()
        }
      
        let insertResGOLogNext = await log_marketplace.create(resGOLogNext);
      
        // console.log( {insertResGOLogNext:insertResGOLogNext }); 

        orderList.push(...responseNext.response.order_list);

        if(!responseNext.response.more) return 0;

        cursor = responseNext.response.next_cursor
        return cursor;
      })
      .catch(error => {
        // The request failed
        console.error('Next Page:', error);
        return 0;
      });
      // console.log({ valueNextCursor : nextCursor})

      if(!nextCursor) break;
    }

    // return response.res200(res, "000", "OrderList Success", { count: orderList.length, orderList: orderList})

    /**     ORDER DETAIL     */

    // Delete the object and transform to string value order_sn only
    orderList = orderList.map(item => item.order_sn);
    // orderList = orderList.slice(0, 20);

    //12122023
    orderList = orderList.filter(order_sn => !customerRefs.includes(order_sn));

    let orderDetails = []

    //Hit API Order Details Request max. 45 sn_list
    for (let i = 0; i < orderList.length/45; i++) {
      console.log(" Loop "+(i+1));
      const extractedString = orderList.slice((i*45), ((i*45)+45)).join(',');

      // console.log("extractedString : "+extractedString)

      if(extractedString){
        let getDetails = await orderDetail(extractedString, shopId);
        orderDetails.push(...getDetails);
  
        // console.log(orderDetails);
      } 
    }

    /**     Save to DB & XML RPC    */

    let internalOrderNo = {}

    const orderPromises = orderDetails.map(async(element) => {

      let orderNo = uuidv4();
  
      let payloadSO = {
          orderno: orderNo,
          debtorno: custBranch.debtorno,
          branchcode: custBranch.branchcode,
          customerref: element.order_sn,
          buyername: element.buyer_username,
          comments: element.note,
          orddate: moment.unix(element.create_time).format('YYYY-MM-DD'),
          ordertype: "GS",
          shipvia: "1",
          deladd1: element.recipient_address.full_address,
          deladd2: element.recipient_address.district,
          deladd3: element.recipient_address.city,
          deladd4: element.recipient_address.state,
          deladd5: element.recipient_address.zipcode,
          deladd6: element.recipient_address.region,
          contactphone: element.recipient_address.phone,
          contactemail: '',
          deliverto: element.recipient_address.name,
          deliverblind: '1',
          freightcost: '0',
          fromstkloc: custBranch.defaultlocation,
          deliverydate: moment.unix(element.ship_by_date).format('YYYY-MM-DD'),
          confirmeddate:moment.unix(element.ship_by_date).format('YYYY-MM-DD'),
          printedpackingslip: '0',
          datepackingslipprinted: moment.unix(element.ship_by_date).format('YYYY-MM-DD'),
          quotation: '0',
          quotedate:  moment.unix(element.ship_by_date).format('YYYY-MM-DD'),
          poplaced: '0',
          salesperson: custBranch.salesman,
          userid: 'marketplace',
          marketplace: "Shopee",
          shop: shopId,
          executed: new Date(),
          migration: 0,
          payload:{
            debtorno: custBranch.debtorno,
            branchcode: custBranch.branchcode,
            customerref: element.order_sn.substring(0, 50),
            buyername: element.buyer_username.substring(0, 50),
            comments: element.note,
            orddate: moment.unix(element.create_time).format('DD/MM/YYYY'),
            ordertype: "GS",
            shipvia: "1",
            deladd1: element.recipient_address.full_address.substring(0, 40),
            deladd2: element.recipient_address.district.substring(0, 40),
            deladd3: element.recipient_address.city.substring(0, 40),
            deladd4: element.recipient_address.state.substring(0, 40),
            deladd5: element.recipient_address.zipcode.substring(0, 20),
            deladd6: element.recipient_address.region.substring(0, 15),
            contactphone: element?.recipient_address?.phone?.substring(0, 25) || "",
            contactemail: '',
            deliverto: element.recipient_address.name.substring(0, 40),
            deliverblind: '1',
            freightcost: 0,
            fromstkloc: custBranch.defaultlocation,
            deliverydate: moment.unix(element.ship_by_date).format('DD/MM/YYYY'),
            confirmeddate:moment.unix(element.ship_by_date).format('DD/MM/YYYY'),
            printedpackingslip: 0,
            datepackingslipprinted: moment.unix(element.ship_by_date).format('DD/MM/YYYY'),
            quotation: 0,
            quotedate:  moment.unix(element.ship_by_date).format('DD/MM/YYYY'),
            poplaced: 0,
            salesperson: custBranch.salesman,
            user: 'marketplace',
          }
      }

      let insertSO = await salesorders.create(payloadSO);

      // console.log( {insertSO:insertSO }); 

      // let payloadSO_XMLRPC = {
      //   debtorno: custBranch.debtorno,
      //   branchcode: custBranch.branchcode,
      //   customerref: element.order_sn.substring(0, 50),
      //   buyername: element.buyer_username.substring(0, 50),
      //   comments: element.note,
      //   orddate: moment.unix(element.create_time).format('DD/MM/YYYY'),
      //   ordertype: "GS",
      //   shipvia: "1",
      //   deladd1: element.recipient_address.full_address.substring(0, 40),
      //   deladd2: element.recipient_address.district.substring(0, 40),
      //   deladd3: element.recipient_address.city.substring(0, 40),
      //   deladd4: element.recipient_address.state.substring(0, 40),
      //   deladd5: element.recipient_address.zipcode.substring(0, 20),
      //   deladd6: element.recipient_address.region.substring(0, 15),
      //   contactphone: element?.recipient_address?.phone?.substring(0, 25) || "",
      //   contactemail: '',
      //   deliverto: element.recipient_address.name.substring(0, 40),
      //   deliverblind: '1',
      //   freightcost: 0,
      //   fromstkloc: custBranch.defaultlocation,
      //   deliverydate: moment.unix(element.ship_by_date).format('DD/MM/YYYY'),
      //   confirmeddate:moment.unix(element.ship_by_date).format('DD/MM/YYYY'),
      //   printedpackingslip: 0,
      //   datepackingslipprinted: moment.unix(element.ship_by_date).format('DD/MM/YYYY'),
      //   quotation: 0,
      //   quotedate:  moment.unix(element.ship_by_date).format('DD/MM/YYYY'),
      //   poplaced: 0,
      //   salesperson: custBranch.salesman,
      //   user: 'marketplace',
      // }

      // // console.log({ payloadSO_XMLRPC: payloadSO_XMLRPC})

      // const reqSO = {
      //   uid: orderNo,
      //   payload: payloadSO_XMLRPC,
      //   marketplace: 'Shopee',
      //   shop_id: shopId,
      //   executed: new Date(),
      //   api: 'SO',
      //   phase: 'Request',
      //   id: uuidv4()
      // }
  
      // let logReqSO = await log_rpc.create(reqSO);
      // console.log( {logReqSO:logReqSO });

      // let orderNoInternal = await xml_rpc.insertSO(payloadSO_XMLRPC)
      // console.log("XML RPC SO: "+orderNoInternal)

      // const resInsSO = {
      //   response : orderNoInternal
      // }

      // const resSO = {
      //   uid: orderNo,
      //   payload: resInsSO,
      //   marketplace: 'Shopee',
      //   shop_id: shopId,
      //   executed: new Date(),
      //   api: 'SO',
      //   phase: 'Response',
      //   id: uuidv4()
      // }
  
      // let logResSO = await log_rpc.create(resSO);
      // // console.log( {logResSO:logResSO }); 

      // let payloadUpdSO = {
      //   executed: new Date()
      // }

      // if(!orderNoInternal[0]) {
      //   payloadUpdSO["success"] = JSON.stringify(orderNoInternal);
      //   payloadUpdSO["migration"] = 1;
      // } else {
      //    payloadUpdSO["error"] = JSON.stringify(orderNoInternal);
      //    payloadUpdSO["migration"] = 0;
      // }

      
      // // console.log({payloadUpdSO: payloadUpdSO })
      // //UPDATE
      // let SOUpdate = await salesorders.update(
      //   payloadUpdSO,
      // {
      //   where: {
      //     orderno: orderNo
      //   }
      // })
      
      // console.log({ SOUpdate: SOUpdate });

      // internalOrderNo[element.order_sn] = (!orderNoInternal[0] ? orderNoInternal[1]:"00000")
      internalOrderNo[element.order_sn] = "-"

      return;
    });

    // Wait for all order promises to complete
    await Promise.all(orderPromises);

    // console.log({ internalOrderNo: internalOrderNo})

    orderDetails.map(async(order) => {

      order.item_list.map(async(element) => {

        let orderLineNo = uuidv4();

        let payloadSOD = {
          orderlineno: orderLineNo,
          // orderno: internalOrderNo[order.order_sn],     
          orderno: "-",     
          koli:'',
          stkcode: element.model_sku,
          qtyinvoiced:'0',
          unitprice:element.model_discounted_price,
          quantity:'1',
          estimate:0,
          discountpercent:0,
          discountpercent2:0,
          actualdispatchdate: moment(new Date()).format('YYYY-MM-DD'),
          completed:'0',
          narrative:'',
          // itemdue: moment.unix(new Date()).format('YYYY-MM-DD'),
          itemdue: moment(new Date()).format('YYYY-MM-DD'),
          poline:0,
          marketplace: "Shopee",
          shop: shopId,
          executed: new Date(),
          migration: 0,
          customerref: order.order_sn,
          payload:{
            orderno: "-",
            koli: '',
            stkcode: element.model_sku,
            qtyinvoiced: 0,
            unitprice: element.model_discounted_price,
            quantity: element.model_quantity_purchased,
            estimate: 0,
            discountpercent: 0,
            discountpercent2: 0,
            actualdispatchdate: moment(new Date()).format('YYYY-MM-DD'),
            completed: 0,
            narrative: 'This is a comment.',
            itemdue: moment(new Date()).format('YYYY-MM-DD'),
            // itemdue: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            poline: '0',
          }
        }
      
        try {
          let insertSOD = await salesorderdetails.create(payloadSOD);
          // console.log({ insertSOD: insertSOD });
        } catch (error) {
          console.error('Error while creating salesorderdetails:', error);
          // Handle the error appropriately, e.g., log it, return an error response, or perform any necessary actions.
        }
        
        // if(internalOrderNo[order.order_sn] != "00000"){
        //   const payloadSOD_XMLRPC = {
        //     // orderlineno: 3, incremental, tidak perlu di request
        //     orderno: internalOrderNo[order.order_sn],
        //     koli: '',
        //     stkcode: element.model_sku,
        //     qtyinvoiced: 0,
        //     unitprice: element.model_discounted_price,
        //     quantity: element.model_quantity_purchased,
        //     estimate: 0,
        //     discountpercent: 0,
        //     discountpercent2: 0,
        //     actualdispatchdate: moment(new Date()).format('YYYY-MM-DD'),
        //     completed: 0,
        //     narrative: 'This is a comment.',
        //     itemdue: moment(new Date()).format('YYYY-MM-DD'),
        //     // itemdue: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        //     poline: '0',
        //   };
        
        //   try {

        //     const reqSOD = {
        //       uid: orderLineNo,
        //       payload: payloadSOD_XMLRPC,
        //       marketplace: 'Shopee',
        //       shop_id: shopId,
        //       executed: new Date(),
        //       api: 'SOD',
        //       phase: 'Request',
        //       id: uuidv4()
        //     }
        
        //     let logReqSOD = await log_rpc.create(reqSOD);
        //     // console.log( {logReqSOD:logReqSOD }); 

        //     let sodRes = await xml_rpc.insertSOD(payloadSOD_XMLRPC);
        //     // console.log("XML RPC SOD: " + sodRes);

        //     const resInsSOD = {
        //       response : sodRes
        //     }

        //     const resSOD = {
        //       uid: orderLineNo,
        //       payload: resInsSOD,
        //       marketplace: 'Shopee',
        //       shop_id: shopId,
        //       executed: new Date(),
        //       api: 'SOD',
        //       phase: 'Response',
        //       id: uuidv4()
        //     }
        
        //     let logResSOD = await log_rpc.create(resSOD);
        //     // console.log( {logResSOD:logResSOD }); 

        //     let payloadUpdSOD = {
        //       executed: new Date()
        //     }
  
        //     if(!sodRes[0]) {
        //       payloadUpdSOD["success"] = JSON.stringify(sodRes);
        //       payloadUpdSOD["migration"] = 1;
        //     } else {
        //       payloadUpdSOD["error"] = JSON.stringify(sodRes);
        //       payloadUpdSOD["migration"] = 0;
        //     }

        //     // console.log({payloadUpdSOD: payloadUpdSOD })
        //     //UPDATE
        //     let SODUpdate = await salesorderdetails.update(
        //       payloadUpdSOD,
        //     {
        //       where: {
        //         orderlineno: orderLineNo
        //       }
        //     }).catch((err) => console.log({ errorSODUpdate: err}))

        //     // console.log({ SODUpdate: SODUpdate });
        //   } catch (error) {
        //     console.error('Error while using XML RPC for SOD:', error);
        //     // Handle the error appropriately, e.g., log it, return an error response, or perform any necessary actions.
        //   }
        // }
        })
      })

    return response.res200(res, "000", "OrderList Success", { count: orderList.length, orderList: orderList, orderDetails:orderDetails })
  })
  .catch(error => {
    // The request failed
    console.error('GET request failed:', error);
    return response.res200(res, "000", "OrderList Failed", { error: error.response.data})
  });

}

const orderDetail = async (sn_list, shopId) => {

  const tokenAccess = await readFileAsync(shopId+'/token.txt');

  // Get current date
  const currentDate = moment();
  
  // Calculate yesterday's date
  const yesterdayDate = currentDate.clone().subtract(1, 'day');
  
  // Set the time to 00:00:00 for yesterday
  const fromTime = yesterdayDate.startOf('day').unix();
  
  // Set the time to 23:59:59 for yesterday
  const toTime = yesterdayDate.endOf('day').unix();

  const timestamp = Math.floor(Date.now() / 1000)
  const time_range_field = 'create_time'
  
  // console.log('moment : '+currentDate);
  // console.log('Unix timestamp for from_date (00:00):', fromTime);
  // console.log('Unix timestamp for to_date (23:59):', toTime);

  // Call public API
  const publicPath = '/api/v2/order/get_order_detail';
  const publicParams = `&shop_id=${shopId}&order_sn_list=${sn_list}&response_optional_fields=buyer_user_id,buyer_username,estimated_shipping_fee,recipient_address,actual_shipping_fee ,goods_to_declare,note,note_update_time,item_list,pay_time,dropshipper,dropshipper_phone,split_up,buyer_cancel_reason,cancel_by,cancel_reason,actual_shipping_fee_confirmed,buyer_cpf_id,fulfillment_flag,pickup_done_time,package_list,shipping_carrier,payment_method,total_amount,buyer_username,invoice_data, checkout_shipping_carrier, reverse_shipping_fee, order_chargeable_weight_gram, edt, prescription_images, prescription_check_status`;

  // console.log('public params: '+publicParams)

  const baseString = `${partnerId}${publicPath}${timestamp}${tokenAccess}${shopId}`;
  
  const sign = generateSign(baseString);

  const url = `${host}${publicPath}?partner_id=${partnerId}&sign=${sign}&timestamp=${timestamp}&access_token=${tokenAccess}${publicParams}`;

  return await axios.get(url).then(({ data: responseApi}) => {
    // console.log({ orderDetail: responseApi})
    return responseApi.response.order_list
  })
  .catch(error => {
    // The request failed
    console.error('GET request failed:', error);
    return error;
  });

}

exports.getOrderDetail = async (req, res) => {

  const tokenAccess = await readFileAsync('token.txt');

  let orderList = []

  // Get current date
  const currentDate = moment();
  
  // Calculate yesterday's date
  const yesterdayDate = currentDate.clone().subtract(1, 'day');
  
  // Set the time to 00:00:00 for yesterday
  const fromTime = yesterdayDate.startOf('day').unix();
  
  // Set the time to 23:59:59 for yesterday
  const toTime = yesterdayDate.endOf('day').unix();

  const timestamp = Math.floor(Date.now() / 1000)
  const time_range_field = 'create_time'
  
  console.log('moment : '+currentDate);
  console.log('Unix timestamp for from_date (00:00):', fromTime);
  console.log('Unix timestamp for to_date (23:59):', toTime);

  // Call public API
  const publicPath = '/api/v2/order/get_order_detail';
  const publicParams = `&shop_id=${shopId}&order_sn_list=231113G4HVNPT0&response_optional_fields=buyer_user_id,buyer_username,estimated_shipping_fee,recipient_address,actual_shipping_fee ,goods_to_declare,note,note_update_time,item_list,pay_time,dropshipper,dropshipper_phone,split_up,buyer_cancel_reason,cancel_by,cancel_reason,actual_shipping_fee_confirmed,buyer_cpf_id,fulfillment_flag,pickup_done_time,package_list,shipping_carrier,payment_method,total_amount,buyer_username,invoice_data, checkout_shipping_carrier, reverse_shipping_fee, order_chargeable_weight_gram, edt, prescription_images, prescription_check_status`;

  console.log('public params: '+publicParams)

  const baseString = `${partnerId}${publicPath}${timestamp}${tokenAccess}${shopId}`;
  
  const sign = generateSign(baseString);

  const url = `${host}${publicPath}?partner_id=${partnerId}&sign=${sign}&timestamp=${timestamp}&access_token=${tokenAccess}${publicParams}`;

  return await axios.get(url).then((responseApi) => {
    console.log({ response: responseApi.data})
    return response.res200(res, "000", "OrderDetail Success", responseApi.data)
  })
  .catch(error => {
    // The request failed
    console.error('GET request failed:', error);
    return response.res200(res, "000", "OrderDetail Failed", { error: error.response.data})
  });

}

exports.xmlRPC = async (req, res) => {
  const jakartaTimezone = 'Asia/Jakarta';
  const currentDate = moment();
  const yesterdayDate = currentDate.clone();
  const fromTime = yesterdayDate.startOf('day').unix();
  const toTime = yesterdayDate.endOf('day').unix();

  const soList = await salesorders.findAll({
    where: {
      executed: {
        [Op.between]: [
          moment.unix(fromTime).toDate(),
          moment.unix(toTime).toDate()
        ]
      }
    }
  });

  const sodList = await salesorderdetails.findAll({
    where: {
      executed: {
        [Op.between]: [
          moment.unix(fromTime).toDate(),
          moment.unix(toTime).toDate()
        ]
      }
    }
  });

  let orderNoList = [];

  for (const payload of soList) {
    const reqSO = {
      uid: uuidv4(),
      payload: payload.payload,
      marketplace: payload.marketplace,
      shop_id: payload.shop,
      executed: new Date(),
      api: 'SO',
      phase: 'Request',
      id: uuidv4()
    };

    let logReqSO = await log_rpc.create(reqSO);
    console.log({ logReqSO: logReqSO });

    let insertSO = await xml_rpc.insertSO(payload.payload);
    console.log("XML RPC SO: " + insertSO);

    let data = {}
    data[payload.customerref] = insertSO
    orderNoList.push(data);

    const resSO = {
      uid: uuidv4(),
      payload: {
        response: insertSO
      },
      marketplace: payload.marketplace,
      shop_id: payload.shop,
      executed: new Date(),
      api: 'SO',
      phase: 'Response',
      id: uuidv4()
    };

    let logResSO = await log_rpc.create(resSO);
    console.log({ logResSO: logResSO });

    // UPDATE
    let payloadUpdSO = {};

    if (!insertSO[0]) {
      payloadUpdSO["success"] = JSON.stringify(insertSO);
      payloadUpdSO["migration"] = 1;
    } else {
      payloadUpdSO["error"] = JSON.stringify(insertSO);
      payloadUpdSO["migration"] = 0;
    }

    console.log({ payloadUpdSO: payloadUpdSO });

    let SOUpdate = await salesorders.update(payloadUpdSO, {
      where: {
        orderno: payload.orderno
      }
    }).catch((err) => console.log({ errorSOUpdate: err }));

    console.log({ SOUpdate: SOUpdate });
  }

  let sodListResult = [];

  for (const payload of sodList) {

    //replace orderno
    const value = getValueByKey(orderNoList, payload.customerref)
    payload.payload.orderno = value && value[1] ? value[1] : 0;

    console.log({ payload: payload.payload})
    console.log({ orderno: payload.payload.orderno})
    console.log({ value: value})
    console.log("CONTINUEEE")

    if(!payload.payload.orderno) continue;

    const reqSOD = {
      uid: uuidv4(),
      payload: payload.payload,
      marketplace: payload.marketplace,
      shop_id: payload.shop,
      executed: new Date(),
      api: 'SOD',
      phase: 'Request',
      id: uuidv4()
    }

    let logReqSOD = await log_rpc.create(reqSOD);
    console.log( {logReqSOD:logReqSOD }); 

    let insertSOD = await xml_rpc.insertSOD(payload.payload);
    console.log("XML RPC SOD: " + insertSOD);

    let data = {}
    data[payload.customerref] = insertSOD
    sodListResult.push(data);

    const resSOD = {
      uid: uuidv4(),
      payload: {
        response: insertSOD
      },
      marketplace: payload.marketplace,
      shop_id: payload.shop,
      executed: new Date(),
      api: 'SOD',
      phase: 'Response',
      id: uuidv4()
    }

    let logResSOD = await log_rpc.create(resSOD);
    console.log( {logResSOD:logResSOD }); 

    let payloadUpdSOD = {};

    if(!insertSOD[0]) {
      payloadUpdSOD["success"] = JSON.stringify(insertSOD);
      payloadUpdSOD["payload"] = payload.payload;
      payloadUpdSOD["migration"] = 1;
    } else {
      payloadUpdSOD["error"] = JSON.stringify(insertSOD);
      payloadUpdSOD["payload"] = payload.payload;
      payloadUpdSOD["migration"] = 0;
    }

    // console.log({payloadUpdSOD: payloadUpdSOD })

    //UPDATE
    let SODUpdate = await salesorderdetails.update(
      payloadUpdSOD,
    {
      where: {
        orderlineno: payload.orderlineno
      }
    }).catch((err) => console.log({ errorSODUpdate: err}))

    console.log({ SODUpdate: SODUpdate });
  }

  return response.res200(res, "000", "OrderList Success", { countSO: orderNoList.length, countSOD: sodListResult.length, resultSO: orderNoList, resultSOD: sodListResult });
};

const getValueByKey = (array, keyToFind) => {
  const foundObject = array.find(obj => keyToFind in obj);
  return foundObject ? foundObject[keyToFind] : null;
}