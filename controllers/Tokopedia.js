const axios = require('axios');
const response = require("@Components/response")
const { salesorderdetails, salesorders, debtorsmaster, custbranch } = require("@Configs/database")
const moment = require('moment');
const xml_rpc = require("@Controllers/xml-rpc-method")
const { FS_ID, SHOP_ID } = process.env
const { v4: uuidv4 } = require('uuid');


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

exports.getOrderList = async (req, res) => {

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
  
  const shopList = res.locals.shop

  let shopExist = {}

  shopList.map(async (shop) => {

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

    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://fs.tokopedia.net/v2/order/list?fs_id='+FS_ID+'&shop_id='+shop.shop_id+'&from_date='+fromTime+'&to_date='+toTime+'&page=1&per_page=10000000',
      headers: { 
        'Authorization': 'Bearer '+res.locals.token
      }
    };
    
    shopExist[shop.shop_name] = await axios.request(config)
    .then(async(resApi) => {

      // console.log(JSON.stringify(resApi.data));
      let filteredOrder =  resApi["data"].data.filter(order => order.order_status >= 500)

      filteredOrder.map(async (element) => {
          console.log(element)
  
          let orderNo = uuidv4();
          let shopInfo = getShopInfo(res.locals.shop, element.shop_id)
  
          let payloadSO = {
              orderno: orderNo,
              debtorno: custBranch.debtorno,
              branchcode: custBranch.branchcode,
              customerref: element.order_id,
              buyername: element.buyer.name,
              comments: "",
              orddate: element.payment_date.split("T")[0],
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
              shop: shop.shop_id
          }
  
          let insertSO = await salesorders.create(payloadSO);
  
          // console.log( {insertSO:insertSO });

          let payloadSO_XMLRPC = {
            debtorno: custBranch.debtorno,
            branchcode: custBranch.branchcode,
            customerref: element.order_id,
            buyername: element.buyer.name,
            comments: "",
            orddate: moment(new Date()).format('DD/MM/YYYY'),
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

          let orderNoInternal = await xml_rpc.insertSO(payloadSO_XMLRPC)

          let payloadUpdSO = {
            executed: new Date()
          }

          if(!orderNoInternal[0]) {
            payloadUpdSO["success"] = JSON.stringify(orderNoInternal);
            payloadUpdSO["migration"] = 1;
          } else {
             payloadUpdSO["error"] = JSON.stringify(orderNoInternal);
             payloadUpdSO["migration"] = 0;
          }

          
          console.log({payloadUpdSO: payloadUpdSO })
          //UPDATE
          let SOResult = await salesorders.update(
            payloadUpdSO,
          {
            where: {
              orderno: orderNo
            }
          })
          
          console.log({ SOResult: SOResult });

          element.products.map(async(product) => {
              let orderLineNo = uuidv4();  

              let payloadSOD = {
                  orderlineno: orderLineNo,
                  orderno: (!orderNoInternal[0] ? orderNoInternal[1]:"00000"),     
                  koli:'',
                  stkcode: product.sku,
                  qtyinvoiced:'0',
                  unitprice:product.total_price,
                  quantity:product.quantity,
                  estimate:0,
                  discountpercent:0,
                  discountpercent2:0,
                  actualdispatchdate: element.shipment_fulfillment.confirm_shipping_deadline,
                  completed:'0',
                  narrative:'',
                  itemdue: element.shipment_fulfillment.accept_deadline.split("T")[0],
                  poline:0,
                  marketplace: "Tokopedia",
                  shop: shop.shop_id
          
              }
          
              let insertSOD = await salesorderdetails.create(payloadSOD);
  
              // console.log( {insertSOD:insertSOD })

              //Jika Response XML RPC SO Success (Ex. Success insert SO: [ 0, '150466' ]), maka dilanjutkan dgn XML RPC untuk SOD
              if(!orderNoInternal[0]){
                const payloadSOD_XMLRPC = {
                  // orderlineno: 3, incremental, tidak perlu di request
                  orderno: orderNoInternal,
                  koli: '',
                  stkcode: product.sku,
                  qtyinvoiced:'0',
                  unitprice:product.total_price,
                  quantity:product.quantity,
                  estimate:0,
                  discountpercent:0,
                  discountpercent2:0,
                  actualdispatchdate: element.shipment_fulfillment.confirm_shipping_deadline,
                  completed:'0',
                  narrative:'',
                  itemdue: moment(new Date()).format('YYYY-MM-DD'),
                  poline: '0',
                };
  
                try {
                  let sodRes = await xml_rpc.insertSOD(payloadSOD_XMLRPC);
                  console.log("XML RPC SOD: " + sodRes);

                  let payloadUpdSOD = {
                    executed: new Date()
                  }
        
                  if(!sodRes[0]) {
                    payloadUpdSOD["success"] = JSON.stringify(sodRes);
                    payloadUpdSOD["migration"] = 1;
                  } else {
                    payloadUpdSOD["error"] = JSON.stringify(sodRes);
                    payloadUpdSOD["migration"] = 0;
                  }

                  // console.log({payloadUpdSOD: payloadUpdSOD })
                  //UPDATE
                  let SODResult = await salesorderdetails.update(
                    payloadUpdSOD,
                  {
                    where: {
                      orderlineno: orderLineNo
                    }
                  }).catch((err) => console.log({ errorSODResult: err}))

                  console.log({ SODResult: SODResult });

                } catch (error) {
                  console.error('Error while using XML RPC for SOD:', error);
                  // Handle the error appropriately, e.g., log it, return an error response, or perform any necessary actions.
                }
              }
          })
      })

      return resApi["data"].data;
    })
    .catch((error) => {
      console.log(error)

      let payloadError = {
        error: error.config
      }

      return payloadError
    })

    console.log({ shopExist: shopExist})
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