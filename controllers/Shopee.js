const axios = require('axios');
const crypto = require('crypto');
const response = require("@Components/response")
const { salesorderdetails, salesorders } = require("@Configs/database")
const moment = require('moment');
const { FS_ID, SHOP_ID, SHOPEE_CODE } = process.env

const host = 'https://partner.shopeemobile.com';
const partnerId = 2006477;
const partnerKey = '644c6d6f4675576c646f7079616f51655052757643484a7876636c437a707552';
const shopId = 308454744;
const merchantId = 1234567;

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

// Function to get Token
exports.getToken = async (req, res) => {

  const path = '/api/v2/auth/token/get';
  const timest = Math.floor(Date.now() / 1000);

  const body = {
    code: SHOPEE_CODE,
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

  console.log( { tokenShopee: res.locals.tokenShopee })

  const path = '/api/v2/auth/access_token/get';
  const timest = Math.floor(Date.now() / 1000);

  const body = {
    refresh_token: '637961636b7243704c69767755437051',
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


// Function to make API requests
async function makeRequest(path, params, method = 'GET') {

  const timest = Math.floor(Date.now() / 1000);
  const accessToken = '73626563416350597a584d4264775270';

  const baseString = `${partnerId}${path}${timest}${accessToken}${params}`;
  const sign = crypto
    .createHmac('sha256', partnerKey)
    .update(baseString)
    .digest('hex');

  const url = `${host}${path}?partner_id=${partnerId}&timestamp=${timest}&access_token=${accessToken}&sign=${sign}${params}`;

  const headers = {
    'Content-Type': 'application/json',
  };  

  const requestOptions = {
    method,
    url,
    headers,
  };

  console.log({ reqConfig: requestOptions })
  try {
    const response = await axios.request(requestOptions);
    return response.data;
  } catch (error) {
    console.log(error.config);
    throw error;
  }
}

exports.getOrderList = async (req, res) => {

  // Get current date
  const currentDate = moment();
  
  // Calculate yesterday's date
  const yesterdayDate = currentDate.clone().subtract(1, 'day');
  
  // Set the time to 00:00:00 for yesterday
  const fromTime = yesterdayDate.startOf('day').unix();
  
  // Set the time to 23:59:59 for yesterday
  const toTime = yesterdayDate.endOf('day').unix();

  const timeNow = new Date();
  
  console.log('moment : '+currentDate);
  console.log('Unix timestamp for from_date (00:00):', fromTime);
  console.log('Unix timestamp for to_date (23:59):', toTime);

  // Call public API
  const publicPath = '/api/v2/order/get_order_list';
  const publicParams = `&shop_id=${shopId}&time_range_field=${timeNow}&time_from=${yesterdayDate}&time_to=${currentDate}&page_size=${20}`;
  makeRequest(publicPath, publicParams) 
    .then((resApi) => {
      console.log('Public API Response:', resApi);
      return response.res200(res, "000", "Generate Success", { fromTime:fromTime, toTime: toTime, currentDate: currentDate,yesterdayDate: yesterdayDate, resApi: resApi })
    })
    .catch((error) => {
      
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
    });

  

}

// exports.getToken = (req, res) => {
//   const shopPath = '/api/v2/auth/token/get';
//   const shopParams = `&shop_id=${shopId}`;

//   makeRequest(shopPath, shopParams)
//     .then((data) => {
//       console.log('Shop Level API Response:', data);
//     })
//     .catch((error) => {
//       console.error('Shop Level API Error:', error);
//     });
// }

// exports.getOrderList = async (req, res) => {

//     // Get current date
//     const currentDate = moment();
    
//     // Calculate yesterday's date
//     const yesterdayDate = currentDate.clone().subtract(1, 'day');
    
//     // Set the time to 00:00:00 for yesterday
//     const fromTime = yesterdayDate.startOf('day').unix();
    
//     // Set the time to 23:59:59 for yesterday
//     const toTime = yesterdayDate.endOf('day').unix();
    
//     console.log('Unix timestamp for from_date (00:00):', fromTime);
//     console.log('Unix timestamp for to_date (23:59):', toTime);

//     const exampleRes = {
//       error: "",
//       message: "",
//       response: {
//         order_list: [
//           {
//             checkout_shipping_carrier: null,
//             reverse_shipping_fee: null,
//             actual_shipping_fee: null,
//             actual_shipping_fee_confirmed: false,
//             buyer_cancel_reason: "",
//             buyer_cpf_id: null,
//             buyer_user_id: 258065,
//             buyer_username: "drcbuy_uat_sg_1",
//             cancel_by: "",
//             cancel_reason: "",
//             cod: false,
//             create_time: 1632973421,
//             currency: "SGD",
//             days_to_ship: 3,
//             dropshipper: "",
//             dropshipper_phone: "",
//             estimated_shipping_fee: 3.99,
//             fulfillment_flag: "fulfilled_by_local_seller",
//             goods_to_declare: false,
//             invoice_data: null,
//             item_list: [
//               {
//                 item_id: 101513055,
//                 item_name: "Vitamin Bottles - Acc",
//                 item_sku: "",
//                 model_id: 0,
//                 model_name: "",
//                 model_sku: "",
//                 model_quantity_purchased: 1,
//                 model_original_price: 3000,
//                 model_discounted_price: 3000,
//                 wholesale: false,
//                 weight: 0.3,
//                 add_on_deal: false,
//                 main_item: false,
//                 add_on_deal_id: 0,
//                 promotion_type: "",
//                 promotion_id: 0,
//                 order_item_id: 101513055,
//                 promotion_group_id: 0,
//                 image_info: {
//                   image_url:
//                     "https://cf.shopee.sg/file/fe05b113170c5e97ed515cf0f2fb9c0e_tn",
//                 },
//                 product_location_id: ["IDL", "IDG"],
//               },
//             ],
//             message_to_seller: "",
//             note: "",
//             note_update_time: 0,
//             order_sn: "210930KJDNF06T",
//             order_status: "COMPLETED",
//             package_list: [
//               {
//                 package_number: "OFG86672620092786",
//                 logistics_status: "LOGISTICS_DELIVERY_DONE",
//                 shipping_carrier: "Singpost POPstation - LPS (seller)",
//                 item_list: [
//                   {
//                     item_id: 101513055,
//                     model_id: 0,
//                     model_quantity: 1,
//                   },
//                 ],
//               },
//             ],
//             pay_time: 1632973437,
//             payment_method: "Credit/Debit Card",
//             pickup_done_time: 1632973711,
//             recipient_address: {
//               name: "Buyer",
//               phone: "163297371110",
//               town: "town",
//               district: "district",
//               city: "city",
//               state: "state",
//               region: "SG",
//               zipcode: "820116",
//               full_address: "BLOCK 116, EDGEFIELD PLAINS, #05-334, SG, 820116",
//             },
//             region: "SG",
//             reverse_shipping_fee: 0,
//             ship_by_date: 1633405439,
//             shipping_carrier: "Singpost POPstation - LPS (seller)",
//             split_up: false,
//             total_amount: 2988.99,
//             update_time: 1633001809,
//           },
//         ],
//       },
//       request_id: "971b45d6a002bfc680019320c9a685a0",
//     };

//     exampleRes["response"]["order_list"].map(async (element) => {
//       console.log(element)

//       let orderNo = generateCustomLengthString(10)

//       let payloadSO = {
//           orderno: orderNo,
//           debtorno: '368',
//           branchcode: '368',
//           customerref: element.order_sn,
//           buyername: element.buyer_username,
//           comments: element.request_id,
//           orddate: moment(element.create_time).format('YYYY-MM-DD'),
//           ordertype: "GS",
//           shipvia: "1",
//           deladd1: element.recipient_address.full_address,
//           deladd2: element.recipient_address.district,
//           deladd3: element.recipient_address.city,
//           deladd4: element.recipient_address.state,
//           deladd5: element.recipient_address.zipcode,
//           deladd6: element.recipient_address.region,
//           contactphone: element.recipient_address.phone,
//           contactemail: 'FishingZone@gmail.com',
//           deliverto: 'Fishing Zone',
//           deliverblind: '2',
//           freightcost: '0',
//           fromstkloc: 'PST',
//           deliverydate: moment(element.ship_by_date).format('YYYY-MM-DD'),
//           confirmeddate: moment(element.pickup_done_time).format('YYYY-MM-DD'),
//           printedpackingslip: '1',
//           datepackingslipprinted: moment(element.ship_by_date).format('YYYY-MM-DD'),
//           quotation: '0',
//           quotedate:  moment(element.ship_by_date).format('YYYY-MM-DD'),
//           poplaced: '0',
//           salesperson: 'P21',
//           userid: element.buyer_user_id
//       }

//       let insertSO = await salesorders.create(payloadSO);

//       console.log( {insertSO:insertSO });

//       let i = 1;
  
//       element.item_list.map(async(product) => {
//           console.log(product)
//           let payloadSOD = {
//               orderlineno: generateCustomLengthString(4),
//               orderno: orderNo,     
//               koli:'',
//               stkcode: product.item_id,
//               qtyinvoiced:'1',
//               unitprice:product.model_original_price,
//               quantity:product.model_quantity_purchased,
//               estimate:0,
//               discountpercent:(parseInt(product.model_discounted_price)/(+product.model_original_price*+product.model_quantity_purchased))*100,
//               discountpercent2:0,
//               actualdispatchdate: moment(element.pickup_done_time).format('YYYY-MM-DD'),
//               completed:'0',
//               narrative:'',
//               itemdue: moment(element.ship_by_date).format('YYYY-MM-DD'),
//               poline:0,
//           }
      
//           let insertSOD = await salesorderdetails.create(payloadSOD);

//           console.log( {insertSOD:insertSOD })
//           i++;
//       })
//   })

//   response.res200(res, "000", "Generate Success", { fromTime:fromTime, toTime: toTime, response: exampleRes })

//   // let config = {
//   //     method: 'get',
//   //     maxBodyLength: Infinity,
//   //     url: 'https://fs.tokopedia.net/v2/order/list?fs_id='+FS_ID+'&shop_id='+SHOP_ID+'&from_date='+fromTime+'&to_date='+toTime+'&page=1&per_page=10000000',
//   //     headers: { 
//   //       'Authorization': 'Bearer '+res.locals.token
//   //     }
//   //   };
    
//   // return await axios.request(config)
//   //   .then(async(resApi) => {

//   //     console.log(JSON.stringify(resApi.data));
//   //     resApi["data"].data.map(async (element) => {
//   //         console.log(element)
  
//   //         let orderNo = generateCustomLengthString(10)+element.order_id
  
//   //         let payloadSO = {
//   //             orderno: orderNo,
//   //             debtorno: '368',
//   //             branchcode: '368',
//   //             customerref: element.payment_id,
//   //             buyername: element.buyer.name,
//   //             comments: element.invoice_ref_num,
//   //             orddate: element.payment_date.split("T")[0],
//   //             ordertype: "GS",
//   //             shipvia: "1",
//   //             deladd1: element.recipient.address.address_full,
//   //             deladd2: element.recipient.address.district,
//   //             deladd3: element.recipient.address.city,
//   //             deladd4: element.recipient.address.province,
//   //             deladd5: element.recipient.address.postal_code,
//   //             deladd6: element.recipient.address.country,
//   //             contactphone: element.recipient.phone,
//   //             contactemail: 'FishingZone@gmail.com',
//   //             deliverto: 'Fishing Zone',
//   //             deliverblind: '2',
//   //             freightcost: '0',
//   //             fromstkloc: 'PST',
//   //             deliverydate: element.shipment_fulfillment.accept_deadline.split("T")[0],
//   //             confirmeddate: element.shipment_fulfillment.confirm_shipping_deadline.split("T")[0],
//   //             printedpackingslip: '1',
//   //             datepackingslipprinted: element.shipment_fulfillment.accept_deadline.split("T")[0],
//   //             quotation: '0',
//   //             quotedate:  element.shipment_fulfillment.accept_deadline.split("T")[0],
//   //             poplaced: '0',
//   //             salesperson: 'P21',
//   //             userid: 'nurul'
//   //         }
  
//   //         let insertSO = await salesorders.create(payloadSO);
  
//   //         console.log( {insertSO:insertSO });
  
//   //         let i = 1;
      
//   //         element.products.map(async(product) => {
//   //             console.log(product)
//   //             let payloadSOD = {
//   //                 orderlineno: generateCustomLengthString(4),
//   //                 orderno: orderNo,     
//   //                 koli:'',
//   //                 stkcode: product.id,
//   //                 qtyinvoiced:'1',
//   //                 unitprice:product.price,
//   //                 quantity:product.quantity,
//   //                 estimate:0,
//   //                 discountpercent:(parseInt(element.promo_order_detail.total_discount_product)/(+product.price*+product.quantity))*100,
//   //                 discountpercent2:0,
//   //                 actualdispatchdate: element.shipment_fulfillment.confirm_shipping_deadline.split("T")[0],
//   //                 completed:'0',
//   //                 narrative:'',
//   //                 itemdue: element.shipment_fulfillment.accept_deadline.split("T")[0],
//   //                 poline:0,
          
//   //             }
          
//   //             let insertSOD = await salesorderdetails.create(payloadSOD);
  
//   //             console.log( {insertSOD:insertSOD })
//   //             i++;
//   //         })
//   //     })

//   //     response.res200(res, "000", "Generate Success", { fromTime:fromTime, toTime: toTime, token: res.locals.token, response: resApi.data })

//   //   })
//   //   .catch((error) => {
//   //     console.log(error)
//   //   });

//   // let payload = {
//   //     orderlineno:'4',
//   //     orderno:'100005',     
//   //     koli:'',
//   //     stkcode:'036282084651',
//   //     qtyinvoiced:'2',
//   //     unitprice:'1111',
//   //     quantity:'2',
//   //     estimate:'0',
//   //     discountpercent:'0',
//   //     discountpercent2:'0',
//   //     actualdispatchdate: new Date(),
//   //     completed:'1',
//   //     narrative:'',
//   //     itemdue: moment(new Date()).format("YYYY-MM-DD"),
//   //     poline:0,

//   // }

//   // let insert = await salesorderdetails.create(payload);

//   // response.res200(res, "000", "Generate Success", { fromTime:fromTime, toTime: toTime, insert: insert })
// }