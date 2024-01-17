const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const response = require("@Components/response")
const xml_rpc = require("@Controllers/xml-rpc-method")
const { salesorderdetails, salesorders, debtorsmaster, custbranch, log_marketplace, log_rpc } = require("@Configs/database")
const crypto = require('crypto');
const LazadaAPI = require('lazada-open-platform-sdk')
const { APP_KEY_LAZADA, APP_SECRET_LAZADA, REGION_LAZADA, AUTH_CODE_LAZADA } = process.env
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');
const { Op } = require("sequelize");

const baseDirectory = path.join(__dirname, '../token/lazada'); // Define the absolute directory path
const aLazadaAPI = new LazadaAPI(APP_KEY_LAZADA, APP_SECRET_LAZADA, REGION_LAZADA)


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

exports.getToken = async (req, res) => {

  const shopId = req.params.shopId

  console.log({ shopId: shopId});

  const getToken = await aLazadaAPI
  .generateAccessToken({ code: AUTH_CODE_LAZADA })
  .then(response => {
      console.log({ response: response})
      const { access_token } = response // JSON data from Lazada's API
      return response;
  })
  
  writeFileAsync(shopId+'/token.txt', getToken.access_token);
  writeFileAsync(shopId+'/refresh_token.txt', getToken.refresh_token);

  return response.res200(res, "000", "Success", { getToken: getToken })
}

exports.refreshToken = async (req, res) => {

  const shopId = req.params.shopId

  console.log({ shopId: shopId});

  const refreshTokenContent = await readFileAsync(shopId+'/refresh_token.txt');

  console.log({ refreshTokenContent: refreshTokenContent})

  const refreshToken = await aLazadaAPI.refreshAccessToken({ refresh_token: refreshTokenContent });

  writeFileAsync(shopId+'/token.txt', refreshToken.access_token);
  writeFileAsync(shopId+'/refresh_token.txt', refreshToken.refresh_token);

  return response.res200(res, "000", "Success", { refreshToken: refreshToken })
}

exports.getOrderList = async (req, res) => {

  const jakartaTimezone = 'Asia/Jakarta';
  const now = moment.tz(jakartaTimezone);

  // Subtract one day to get yesterday
  const yesterday = now.subtract(7, 'days');

  // Set the time to 00:00:00
  yesterday.startOf('day');

  // Format the timestamp in the desired format
  const formattedTimestamp = yesterday.format('YYYY-MM-DDTHH:mm:ssZ');
      
  console.log('formattedTimestamp : '+formattedTimestamp);

  const uidLog = uuidv4();

  const shopId = req.params.shopId

  const tokenContent = await readFileAsync(shopId+'/token.txt');

  const debtOrsmaster = await debtorsmaster.findOne({
    raw: true,
    where: {
      idseller: shopId
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
      marketplace: "Lazada",
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

  // return response.res200(res, "000", "Success", {customerRefs: customerRefs, custBranch: custBranch, tokenContent: tokenContent })

  //Shipped

  const payloadGO = {
    access_token: tokenContent,
    created_after: formattedTimestamp,
    status: "shipped",
  };

  const reqGOLog = {
    uid: uidLog,
    payload: payloadGO,
    marketplace: 'Lazada',
    shop_id: shopId,
    executed: new Date(),
    api: 'getOrders',
    phase: 'Request',
    id: uuidv4()
  }

  let insertReqGOLog = await log_marketplace.create(reqGOLog);

  console.log( {insertReqGOLog:insertReqGOLog }); 

  // const listOrders = await aLazadaAPI.getOrders({ access_token: tokenContent, created_after: formattedTimestamp })
  const shipped = await aLazadaAPI.getOrders(payloadGO)
  .then(async (resApi) => {
    console.log({ resApi: resApi})

    const resGOLog = {
      uid: uidLog,
      payload: resApi,
      marketplace: 'Lazada',
      shop_id: shopId,
      executed: new Date(),
      api: 'getOrders',
      phase: 'Response',
      id: uuidv4()
    }

    let insertResGOLog = await log_marketplace.create(resGOLog);
    console.log( {insertResGOLog:insertResGOLog }); 

    return resApi
  })
  .catch((err) => console.log(err))

  // Delivered
  const payloadGO2 = {
    access_token: tokenContent,
    created_after: formattedTimestamp,
    status: "delivered",
  };

  const reqGOLog2 = {
    uid: uidLog,
    payload: payloadGO2,
    marketplace: 'Lazada',
    shop_id: shopId,
    executed: new Date(),
    api: 'getOrders',
    phase: 'Request',
    id: uuidv4()
  }

  let insertReqGOLog2 = await log_marketplace.create(reqGOLog2);

  console.log( {insertReqGOLog2:insertReqGOLog2 }); 

  // const listOrders = await aLazadaAPI.getOrders({ access_token: tokenContent, created_after: formattedTimestamp })
  const delivered = await aLazadaAPI.getOrders(payloadGO2)
  .then(async (resApi) => {
    console.log({ resApi: resApi})

    const resGOLog2 = {
      uid: uidLog,
      payload: resApi,
      marketplace: 'Lazada',
      shop_id: shopId,
      executed: new Date(),
      api: 'getOrders',
      phase: 'Response',
      id: uuidv4()
    }

    let insertResGOLog2 = await log_marketplace.create(resGOLog2);
    console.log( {insertResGOLog2:insertResGOLog2 }); 

    return resApi
  })
  .catch((err) => console.log(err))
  
  const orders = shipped.data.orders;
  const shippedData = orders.map(order => order.order_id);

  const orders2 = delivered.data.orders;
  const deliveredData = orders2.map(orders => orders.order_id);

  const orderIds = [...shippedData, ...deliveredData]

  if(!orderIds.length) return response.res200(res, "003", "Data Empty", { count: 0, countTotal: 0, orders: [] });

  console.log(orderIds)
  // Convert the array of order IDs to a string format "[order_id, order_id, ...]"
  const formattedOrderIds = "[" + orderIds.join() + "]";
  console.log(formattedOrderIds)

  const payloadGMOI = {
    access_token: tokenContent,
    order_ids: formattedOrderIds,
  };

  const reqGMOILog = {
    uid: uidLog,
    payload: payloadGMOI,
    marketplace: 'Lazada',
    shop_id: shopId,
    executed: new Date(),
    api: 'getMultipleOrderItems',
    phase: 'Request',
    id: uuidv4()
  }

  let insertReqGMOILog = await log_marketplace.create(reqGMOILog);

  console.log( {insertReqGMOILog:insertReqGMOILog }); 

  const listOrderItems = await aLazadaAPI.getMultipleOrderItems(payloadGMOI)
  .then(async (resApi) => {
    console.log({ resApi: resApi})

    const resGMOILog = {
      uid: uidLog,
      payload: resApi,
      marketplace: 'Lazada',
      shop_id: shopId,
      executed: new Date(),
      api: 'getMultipleOrderItems',
      phase: 'Response',
      id: uuidv4()
    }

    let insertResGMOILog = await log_marketplace.create(resGMOILog);
    console.log( {insertResGMOILog:insertResGMOILog }); 

    return resApi
  })
  .catch((err) => console.log(err))

  // return response.res200(res, "000", "Success", {count: listOrderItems.data.length,listOrderItems: listOrderItems })

  let internalOrderNo = {}

  const orderPromises = orders.map(async(element) => {

    //12122023
    if(customerRefs.includes(element.order_number)) return;

    let orderNo = uuidv4();

    let payloadSO = {
        orderno: orderNo,
        debtorno: custBranch.debtorno,
        branchcode: custBranch.branchcode,
        customerref: element.order_number,
        buyername: element.address_billing.first_name,
        comments: element.remarks,
        orddate: element.created_at.split(" ")[0],
        ordertype: "GS",
        shipvia: "1",
        deladd1: element.address_shipping.address1,
        deladd2: element.address_shipping.address3,
        deladd3: element.address_shipping.address4,
        deladd4: element.address_shipping.address5,
        deladd5: element.address_shipping.post_code,
        deladd6: element.address_shipping.country,
        contactphone: element.address_shipping.phone,
        contactemail: '',
        deliverto: element.address_shipping.first_name,
        deliverblind: '1',
        freightcost: '0',
        fromstkloc: custBranch.defaultlocation,
        deliverydate: element.updated_at.split(" ")[0],
        confirmeddate:element.updated_at.split(" ")[0],
        printedpackingslip: '0',
        datepackingslipprinted: element.updated_at.split(" ")[0],
        quotation: '0',
        quotedate:  element.updated_at.split(" ")[0],
        poplaced: '0',
        salesperson: custBranch.salesman,
        userid: 'marketplace',
        marketplace: "Lazada",
        shop: shopId,
        executed: new Date(),
        migration: 0,
        payload: {
          debtorno: custBranch.debtorno,
          branchcode: custBranch.branchcode,
          customerref: element.order_number.toString().substring(0, 50),
          buyername: element.address_billing.first_name.substring(0, 50),
          comments: element.remarks,
          orddate: moment(element.created_at.split(" ")[0], 'YYYY-MM-DD').format('DD/MM/YYYY'),
          ordertype: "GS",
          shipvia: "1",
          deladd1: element.address_shipping.address1.substring(0, 40),
          deladd2: element.address_shipping.address3.substring(0, 40),
          deladd3: element.address_shipping.address4.substring(0, 40),
          deladd4: element.address_shipping.address5.substring(0, 40),
          deladd5: element.address_shipping.post_code.substring(0, 20),
          deladd6: element.address_shipping.country.substring(0, 15),
          contactphone: element?.address_shipping?.phone?.substring(0, 25) || "",
          contactemail: '',
          deliverto: element.address_shipping.first_name.substring(0, 40),
          deliverblind: '1',
          freightcost: 0,
          fromstkloc: custBranch.defaultlocation,
          deliverydate: moment(new Date()).format('DD/MM/YYYY'),
          confirmeddate:moment(new Date()).format('DD/MM/YYYY'),
          printedpackingslip: 0,
          datepackingslipprinted: moment(new Date()).format('DD/MM/YYYY'),
          quotation: 0,
          quotedate:  moment(new Date()).format('DD/MM/YYYY'),
          poplaced: 0,
          salesperson: custBranch.salesman,
          user: 'marketplace'
        }
    }

    let insertSO = await salesorders.create(payloadSO);

    console.log( {insertSO:insertSO }); 

    // let payloadSO_XMLRPC = {
    //     debtorno: custBranch.debtorno,
    //     branchcode: custBranch.branchcode,
    //     customerref: element.order_number.toString().substring(0, 50),
    //     buyername: element.address_billing.first_name.substring(0, 50),
    //     comments: element.remarks,
    //     orddate: moment(element.created_at.split(" ")[0], 'YYYY-MM-DD').format('DD/MM/YYYY'),
    //     ordertype: "GS",
    //     shipvia: "1",
    //     deladd1: element.address_shipping.address1.substring(0, 40),
    //     deladd2: element.address_shipping.address3.substring(0, 40),
    //     deladd3: element.address_shipping.address4.substring(0, 40),
    //     deladd4: element.address_shipping.address5.substring(0, 40),
    //     deladd5: element.address_shipping.post_code.substring(0, 20),
    //     deladd6: element.address_shipping.country.substring(0, 15),
    //     contactphone: element?.address_shipping?.phone?.substring(0, 25) || "",
    //     contactemail: '',
    //     deliverto: element.address_shipping.first_name.substring(0, 40),
    //     deliverblind: '1',
    //     freightcost: 0,
    //     fromstkloc: custBranch.defaultlocation,
    //     deliverydate: moment(new Date()).format('DD/MM/YYYY'),
    //     confirmeddate:moment(new Date()).format('DD/MM/YYYY'),
    //     printedpackingslip: 0,
    //     datepackingslipprinted: moment(new Date()).format('DD/MM/YYYY'),
    //     quotation: 0,
    //     quotedate:  moment(new Date()).format('DD/MM/YYYY'),
    //     poplaced: 0,
    //     salesperson: custBranch.salesman,
    //     user: 'marketplace'
    // }

    // const reqSO = {
    //   uid: orderNo,
    //   payload: payloadSO_XMLRPC,
    //   marketplace: 'Lazada',
    //   shop_id: shopId,
    //   executed: new Date(),
    //   api: 'SO',
    //   phase: 'Request',
    //   id: uuidv4()
    // }

    // let logReqSO = await log_rpc.create(reqSO);
    // console.log( {logReqSO:logReqSO }); 

    // let orderNoInternal = await xml_rpc.insertSO(payloadSO_XMLRPC)

    // const resInsSO = {
    //   response : orderNoInternal
    // }

    // const resSO = {
    //   uid: orderNo,
    //   payload: resInsSO,
    //   marketplace: 'Lazada',
    //   shop_id: shopId,
    //   executed: new Date(),
    //   api: 'SO',
    //   phase: 'Response',
    //   id: uuidv4()
    // }

    // let logResSO = await log_rpc.create(resSO);
    // console.log( {logResSO:logResSO }); 

    // console.log("XML RPC SO: "+orderNoInternal)

    // let payloadUpdSO = {
    //   executed: new Date()
    // }

    // if(!orderNoInternal[0]) {
    //   payloadUpdSO["success"] = JSON.stringify(orderNoInternal);
    //   payloadUpdSO["migration"] = 1;
    // } else {
    //     payloadUpdSO["error"] = JSON.stringify(orderNoInternal);
    //     payloadUpdSO["migration"] = 0;
    // }

    
    // console.log({payloadUpdSO: payloadUpdSO })
    // //UPDATE
    // let SOUpdate = await salesorders.update(
    //   payloadUpdSO,
    // {
    //   where: {
    //     orderno: orderNo
    //   }
    // })
    
    // console.log({ SOUpdate: SOUpdate });

    // internalOrderNo[element.order_number] = (!orderNoInternal[0] ? orderNoInternal[1]:"00000")
    internalOrderNo[element.order_number] = "-"
    // console.log({ internalOrderNoExist: internalOrderNo })

    return;
  });

  // Wait for all order promises to complete
  await Promise.all(orderPromises);

  console.log({ internalOrderNo: internalOrderNo})

  // return response.res200(res, "000", "Success", {internalOrderNo: internalOrderNo, listOrders: listOrders })

  //12122023
  listOrderItems.data = listOrderItems.data.filter(order => !customerRefs.includes(order.order_number));

  listOrderItems.data.map(async (order) => {

      order.order_items.map(async (element) => {
          let orderLineNo = uuidv4();

          let payloadSOD = {
              orderlineno: orderLineNo,
              // orderno: internalOrderNo[order.order_number],     
              orderno: "-",     
              koli:'',
              stkcode: element.sku,
              qtyinvoiced:'0',
              unitprice:+element.paid_price + +element.voucher_platform,
              quantity:'1',
              estimate:0,
              discountpercent:0,
              discountpercent2:0,
              actualdispatchdate: moment(new Date()).format('YYYY-MM-DD'),
              completed:'0',
              narrative:'',
              // itemdue: element.created_at.split(" ")[0],
              itemdue: moment(new Date()).format('YYYY-MM-DD'),
              // itemdue: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
              poline:0,
              marketplace: "Lazada",
              shop: shopId,
              customerref: order.order_number,
              executed: new Date(),
              migration: 0,
              payload:{
                orderno: "-",
                koli: '',
                stkcode: element.sku,
                qtyinvoiced: 0,
                unitprice: +element.paid_price + +element.voucher_platform, //update dari item_price jadi paid_price 11/01/2024
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

          // if(internalOrderNo[order.order_sn] != "00000"){

          //   const payloadSOD_XMLRPC = {
          //     // orderlineno: 3, incremental, tidak perlu di request
          //     orderno: internalOrderNo[order.order_number],
          //     koli: '',
          //     stkcode: element.sku,
          //     qtyinvoiced: 0,
          //     unitprice: element.item_price,
          //     quantity: 1,
          //     estimate: 0,
          //     discountpercent: 0,
          //     discountpercent2: 0,
          //     actualdispatchdate: moment(new Date()).format('YYYY-MM-DD'),
          //     completed: 0,
          //     narrative: 'This is a comment.',
          //     itemdue: moment(new Date()).format('YYYY-MM-DD'),
          //     poline: '0',
          //   };

          //   try {

          //     const reqSOD = {
          //       uid: orderLineNo,
          //       payload: payloadSOD_XMLRPC,
          //       marketplace: 'Lazada',
          //       shop_id: shopId,
          //       executed: new Date(),
          //       api: 'SOD',
          //       phase: 'Request',
          //       id: uuidv4()
          //     }
          
          //     let logReqSOD = await log_rpc.create(reqSOD);
          //     console.log( {logReqSOD:logReqSOD }); 

          //     let sodRes = await xml_rpc.insertSOD(payloadSOD_XMLRPC);
          //     console.log("XML RPC SOD: " + sodRes);

          //     const resInsSOD = {
          //       response : sodRes
          //     }

          //     const resSOD = {
          //       uid: orderLineNo,
          //       payload: resInsSOD,
          //       marketplace: 'Lazada',
          //       shop_id: shopId,
          //       executed: new Date(),
          //       api: 'SOD',
          //       phase: 'Response',
          //       id: uuidv4()
          //     }
          
          //     let logResSOD = await log_rpc.create(resSOD);
          //     console.log( {logResSOD:logResSOD }); 

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

          //     console.log({ SODUpdate: SODUpdate });
          //   } catch (error) {
          //     console.error('Error while using XML RPC for SOD:', error);
          //     // Handle the error appropriately, e.g., log it, return an error response, or perform any necessary actions.
          //   }
          // }
      })
  });

  console.log({ listOrderItems : listOrderItems})
      
  return response.res200(res, "000", "Success", { count: listOrderItems.data.length, listOrderItems: listOrderItems })

}