const axios = require('axios');
const response = require("@Components/response")
const { salesorderdetails, salesorders, debtorsmaster, custbranch, log_marketplace, log_rpc } = require("@Configs/database")
const moment = require('moment');
const xml_rpc = require("@Controllers/xml-rpc-method")
const { FS_ID, SHOP_ID } = process.env
const { v4: uuidv4 } = require('uuid');
const { Op } = require("sequelize");

const getShopInfo = (shopList, shopId) => {
  let shopInfo = {}

  shopList.map((shop) => {

    if(shopId == shop.shop_id){
      shopInfo.shop_id = shop.shop_id
      shopInfo.shop_name = shop.shop_name
      shopInfo.email = shop.email
      shopInfo.phone = shop.phone
    }

  })

  return shopInfo;
}

exports.stressTest = async (req, res) => {
  console.log("Stress Test")
  let result = []

  for (let i = 0; i < 100; i++) {
    console.log(`Iteration ${i + 1}`);
    let payloadSO_XMLRPC = {
      debtorno: '832',
      branchcode: '832',
      customerref: '231128RR1J9RBE',
      buyername: 'nurlsaja',
      comments: '',
      orddate: '28/11/2023',
      ordertype: 'GS',
      shipvia: '1',
      deladd1: 'Pecel lele depan villa Tubagus jln raya ',
      deladd2: 'ANYAR',
      deladd3: 'KAB. SERANG',
      deladd4: 'BANTEN',
      deladd5: '42166',
      deladd6: 'ID',
      contactphone: '6285180656608',
      contactemail: '',
      deliverto: 'Nuril abidin',
      deliverblind: '1',
      freightcost: 0,
      fromstkloc: 'PST',
      deliverydate: '30/11/2023',
      confirmeddate: '30/11/2023',
      printedpackingslip: 0,
      datepackingslipprinted: '30/11/2023',
      quotation: 0,
      quotedate: '30/11/2023',
      poplaced: 0,
      salesperson: 'DM',
      user: 'marketplace'
    }

    let resSO = await xml_rpc.insertSO(payloadSO_XMLRPC)
    result = [...result, ...resSO]
    console.log({ payloadSO: resSO})
  }
  
  return response.res200(res, "000", "Success", { result: result });
}

exports.getOrderList = async (req, res) => {

  // Get current date
  const currentDate = moment();

  const jakartaTimezone = 'Asia/Jakarta';
  
  // Calculate yesterday's date
  const yesterdayDate = currentDate.clone().subtract(3, 'day');
  
  // Set the time to 00:00:00 for yesterday
  const fromTime = yesterdayDate.startOf('day').unix();

  // Calculate the end date (yesterday)
  const endDate = currentDate.clone().subtract(1, 'day');

  // Set the time to 23:59:59 for yesterday
  const toTime = endDate.endOf('day').unix();

  // Set the time to 23:59:59 for yesterday
  // const toTime = yesterdayDate.endOf('day').unix();
  
  console.log('Unix timestamp for from_date (00:00):', fromTime);
  console.log('Unix timestamp for to_date (23:59):', toTime);
  
  const shopList = res.locals.shop

  let shopExist = {}

  shopList.map(async (shop) => {

    console.log("Shop ID: "+shop.shop_id+", Shop Name : "+shop.shop_name);

    if(shop.shop_id == "532435") return;
    shopExist[shop.shop_name] = {}

    const debtOrsmaster = await debtorsmaster.findOne({
      raw: true,
      where: {
        idseller: shop.shop_id.toString()
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
        marketplace: "Tokopedia",
        // migration: "1",
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

    // return response.res200(res, "000", "Success", {customerRefs: customerRefs, custBranch: custBranch })

    const uidLog = uuidv4();

    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://fs.tokopedia.net/v2/order/list?fs_id='+FS_ID+'&shop_id='+shop.shop_id+'&from_date='+fromTime+'&to_date='+toTime+'&page=1&per_page=100000',
      headers: { 
        'Authorization': 'Bearer '+res.locals.token
      }
    };
    
    const reqGOLog = {
      uid: uidLog,
      payload: config,
      marketplace: 'Tokopedia',
      shop_id: shop.shop_id,
      executed: new Date(),
      api: '/v2/order/list',
      phase: 'Request',
      id: uuidv4()
    }

    let insertReqGOLog = await log_marketplace.create(reqGOLog);

    console.log( {insertReqGOLog:insertReqGOLog }); 

    shopExist[shop.shop_name] = await axios.request(config)
    .then(async(resApi) => {

      const resGOLog = {
        uid: uidLog,
        payload: resApi.data,
        marketplace: 'Tokopedia',
        shop_id: shop.shop_id,
        executed: new Date(),
        api: '/v2/order/list',
        phase: 'Response',
        id: uuidv4()
      }
  
      let insertResGOLog = await log_marketplace.create(resGOLog);
      console.log( {insertResGOLog:insertResGOLog }); 

      // console.log(JSON.stringify(resApi.data));
      let filteredOrder =  resApi["data"].data.filter(order => order.order_status >= 500)

      filteredOrder = filteredOrder.filter(order => !customerRefs.includes(order.invoice_ref_num));

      filteredOrder.map(async (element) => {
          console.log(element)

          //12122023
          // if(customerRefs.includes(element.invoice_ref_num)) return;
  
          let orderNo = uuidv4();
          let shopInfo = getShopInfo(res.locals.shop, element.shop_id)
  
          let payloadSO = {
            orderno: orderNo,
            debtorno: custBranch.debtorno,
            branchcode: custBranch.branchcode,
            customerref: element.invoice_ref_num,
            buyername: element.buyer.name,
            comments: "",
            // orddate: element.create_time,
            orddate: moment.unix(element.create_time).format('YYYY-MM-DD'),
            ordertype: "GS",
            shipvia: "1",
            deladd1: element.recipient.address.address_full,
            deladd2: element.recipient.address.district,
            deladd3: element.recipient.address.city,
            deladd4: element.recipient.address.province,
            deladd5: element.recipient.address.postal_code,
            deladd6: element.recipient.address.country,
            contactphone: shopInfo.phone,
            contactemail: shopInfo.email,
            deliverto: shopInfo.shop_name,
            deliverblind: '1',
            freightcost: '0',
            fromstkloc: custBranch.defaultlocation,
            deliverydate: element.shipment_fulfillment.accept_deadline.split("T")[0],
            confirmeddate: element.shipment_fulfillment.confirm_shipping_deadline.split("T")[0],
            printedpackingslip: '0',
            datepackingslipprinted: element.shipment_fulfillment.accept_deadline.split("T")[0],
            quotation: '0',
            quotedate:  element.shipment_fulfillment.accept_deadline.split("T")[0],
            poplaced: '0',
            salesperson: custBranch.salesman,
            userid: 'marketplace',
            marketplace: "Tokopedia",
            shop: shop.shop_id,
            executed: new Date(),
            migration: 0,
            payload:{
              debtorno: custBranch.debtorno,
              branchcode: custBranch.branchcode,
              customerref: element.invoice_ref_num.toString().substring(0, 50),
              buyername: element.buyer.name.substring(0, 50),
              comments: "",
              orddate: moment.unix(element.create_time).format('DD/MM/YYYY'),
              // orddate: moment(new Date()).format('DD/MM/YYYY'),
              ordertype: "GS",
              shipvia: "1",
              deladd1: element.recipient.address.address_full.substring(0, 40),
              deladd2: element.recipient.address.district.substring(0, 40),
              deladd3: element.recipient.address.city.substring(0, 40),
              deladd4: element.recipient.address.province.substring(0, 40),
              deladd5: element.recipient.address.postal_code.substring(0, 20),
              deladd6: element.recipient.address.country.substring(0, 15),
              contactphone: shopInfo?.phone?.substring(0, 25) || "",
              contactemail: shopInfo?.email?.substring(0, 40) || "",
              deliverto: shopInfo.shop_name.substring(0, 40),
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
          //   debtorno: custBranch.debtorno,
          //   branchcode: custBranch.branchcode,
          //   customerref: element.invoice_ref_num.toString().substring(0, 50),
          //   buyername: element.buyer.name.substring(0, 50),
          //   comments: "",
          //   orddate: moment.unix(element.create_time).format('DD/MM/YYYY'),
          //   // orddate: moment(new Date()).format('DD/MM/YYYY'),
          //   ordertype: "GS",
          //   shipvia: "1",
          //   deladd1: element.recipient.address.address_full.substring(0, 40),
          //   deladd2: element.recipient.address.district.substring(0, 40),
          //   deladd3: element.recipient.address.city.substring(0, 40),
          //   deladd4: element.recipient.address.province.substring(0, 40),
          //   deladd5: element.recipient.address.postal_code.substring(0, 20),
          //   deladd6: element.recipient.address.country.substring(0, 15),
          //   contactphone: shopInfo?.phone?.substring(0, 25) || "",
          //   contactemail: shopInfo?.email?.substring(0, 40) || "",
          //   deliverto: shopInfo.shop_name.substring(0, 40),
          //   deliverblind: '1',
          //   freightcost: 0,
          //   fromstkloc: custBranch.defaultlocation,
          //   deliverydate: moment(new Date()).format('DD/MM/YYYY'),
          //   confirmeddate:moment(new Date()).format('DD/MM/YYYY'),
          //   printedpackingslip: 0,
          //   datepackingslipprinted: moment(new Date()).format('DD/MM/YYYY'),
          //   quotation: 0,
          //   quotedate:  moment(new Date()).format('DD/MM/YYYY'),
          //   poplaced: 0,
          //   salesperson: custBranch.salesman,
          //   user: 'marketplace'
          // }

          // const reqSO = {
          //   uid: orderNo,
          //   payload: payloadSO_XMLRPC,
          //   marketplace: 'Tokopedia',
          //   shop_id: shop.shop_id,
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
          //   marketplace: 'Tokopedia',
          //   shop_id: shop.shop_id,
          //   executed: new Date(),
          //   api: 'SO',
          //   phase: 'Response',
          //   id: uuidv4()
          // }
      
          // let logResSO = await log_rpc.create(resSO);
          // console.log( {logResSO:logResSO }); 

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

          element.products.map(async(product) => {
            let orderLineNo = uuidv4();  

            let payloadSOD = {
              orderlineno: orderLineNo,
              // orderno: (!orderNoInternal[0] ? orderNoInternal[1]:"00000"),     
              orderno: "-",    
              koli:'',
              stkcode: product.sku,
              qtyinvoiced:'0',
              unitprice:product.price,
              quantity:product.quantity,
              estimate:0,
              discountpercent:0,
              discountpercent2:0,
              // actualdispatchdate: element.shipment_fulfillment.confirm_shipping_deadline,
              actualdispatchdate: moment(new Date()).format('YYYY-MM-DD'),
              completed:'0',
              narrative:'',
              // itemdue: element.shipment_fulfillment.accept_deadline.split("T")[0],
              itemdue: moment(new Date()).format('YYYY-MM-DD'),
              poline:0,
              marketplace: "Tokopedia",
              shop: shop.shop_id,
              executed: new Date(),
              migration: 0,
              customerref: element.invoice_ref_num,
              payload:{
                orderno: "-",
                koli: '',
                stkcode: product.sku,
                qtyinvoiced:0,
                unitprice:product.price,
                quantity:product.quantity,
                estimate:0,
                discountpercent:0,
                discountpercent2:0,
                // actualdispatchdate: element.shipment_fulfillment.confirm_shipping_deadline,
                actualdispatchdate: moment(new Date()).format('YYYY-MM-DD'),
                completed:0,
                narrative:'',
                itemdue: moment(new Date()).format('YYYY-MM-DD'),
                poline: '0',
              }
            }
        
            let insertSOD = await salesorderdetails.create(payloadSOD);

            console.log( {insertSOD:insertSOD })

            //Jika Response XML RPC SO Success (Ex. Success insert SO: [ 0, '150466' ]), maka dilanjutkan dgn XML RPC untuk SOD
            // if(!orderNoInternal[0]){
            //   const payloadSOD_XMLRPC = {
            //     // orderlineno: 3, incremental, tidak perlu di request
            //     orderno: orderNoInternal,
            //     koli: '',
            //     stkcode: product.sku,
            //     qtyinvoiced:'0',
            //     unitprice:product.total_price,
            //     quantity:product.quantity,
            //     estimate:0,
            //     discountpercent:0,
            //     discountpercent2:0,
            //     // actualdispatchdate: element.shipment_fulfillment.confirm_shipping_deadline,
            //     actualdispatchdate: new Date(),
            //     completed:'0',
            //     narrative:'',
            //     itemdue: moment(new Date()).format('YYYY-MM-DD'),
            //     poline: '0',
            //   };

            //   try {

            //     const reqSOD = {
            //       uid: orderLineNo,
            //       payload: payloadSOD_XMLRPC,
            //       marketplace: 'Tokopedia',
            //       shop_id: shop.shop_id,
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
            //       marketplace: 'Tokopedia',
            //       shop_id: shop.shop_id,
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
      })

      let resInfo = {
        count: filteredOrder.length, 
        countTokopedia: resApi["data"].data.length, 
        data:resApi["data"].data
      }

      return resInfo;
    })
    .catch((error) => {
      console.log(error)

      let payloadError = {
        error: error.config
      }

      return payloadError
    })

    // console.log({ shopExist: shopExist})
  })

  return response.res200(res, "000", "Success", { fromTime:fromTime, toTime: toTime, token: res.locals.token, shopList: shopExist });
}

exports.getSingleOrder = async (req, res) => {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://fs.tokopedia.net/v2/fs/"+FS_ID+"/order?order_id="+req.params.order_id,
    headers: {
      Authorization: "Bearer "+res.locals.token,
    },
  };

  return await axios.request(config)
    .then(({ data: resApi }) => {
      return response.res200(res, "000", "Success", { response: resApi });
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.getShop = async (req, res) => {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://fs.tokopedia.net/v1/shop/fs/"+FS_ID+"/shop-info?page=1&per_page=50",
    headers: {
      Authorization: "Bearer "+res.locals.token,
    },
  };

  return await axios.request(config)
    .then(({ data: resApi }) => {
      return response.res200(res, "000", "Success", resApi);
    })
    .catch((error) => {
      console.log(error);
    });
};