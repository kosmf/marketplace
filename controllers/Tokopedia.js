const axios = require('axios');
const response = require("@Components/response")
const { salesorderdetails, salesorders } = require("@Configs/database")
const moment = require('moment');
const { FS_ID, SHOP_ID } = process.env

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

    // let resApi = {}
    // resApi["data"] = [
    //     {
    //         fs_id: "",
    //         order_id: 1637503258,
    //         is_cod_mitra: false,
    //         accept_partial: false,
    //         invoice_ref_num: "INV/20230806/MPL/3387274082",
    //         have_product_bundle: false,
    //         products: [
    //         {
    //             id: 8489433034,
    //             name: "Umpan pancing SEBILE STICK SHADD - FTG, 72mm/7gr",
    //             quantity: 1,
    //             notes: "",
    //             weight: 0.1,
    //             total_weight: 0.1,
    //             price: 55200,
    //             total_price: 55200,
    //             currency: "Rp",
    //             sku: "",
    //             is_wholesale: false,
    //         },
    //         ],
    //         products_fulfilled: [
    //         {
    //             product_id: 8489433034,
    //             quantity_deliver: 1,
    //             quantity_reject: 0,
    //         },
    //         ],
    //         bundle_detail: {
    //         bundle: null,
    //         non_bundle: null,
    //         total_product: 0,
    //         },
    //         device_type: "",
    //         buyer: {
    //         id: 81554025,
    //         name: "",
    //         phone: "",
    //         email: "",
    //         user_status: 0,
    //         },
    //         shop_id: 13069412,
    //         payment_id: 2341927514,
    //         payment_date: "2023-08-06T17:40:02Z",
    //         recipient: {
    //         name: "",
    //         phone: "",
    //         address: {
    //             address_full: "",
    //             district: "Penjaringan",
    //             city: "Kota Administrasi Jakarta Utara",
    //             province: "DKI Jakarta",
    //             country: "Indonesia",
    //             postal_code: "14440",
    //             district_id: 2286,
    //             city_id: 177,
    //             province_id: 13,
    //             geo: "-6.093656,106.791614",
    //         },
    //         },
    //         logistics: {
    //         shipping_id: 23,
    //         sp_id: 0,
    //         district_id: 0,
    //         city_id: 0,
    //         province_id: 0,
    //         geo: "",
    //         shipping_agency: "AnterAja",
    //         service_type: "Economy",
    //         },
    //         amt: {
    //         ttl_product_price: 55200,
    //         shipping_cost: 7100,
    //         insurance_cost: 400,
    //         ttl_amount: 62700,
    //         voucher_amount: 0,
    //         toppoints_amount: 0,
    //         },
    //         dropshipper_info: {},
    //         voucher_info: {
    //         voucher_code: "",
    //         voucher_type: 0,
    //         voucher_amount: 0,
    //         },
    //         order_status: 450,
    //         warehouse_id: 12983155,
    //         fulfill_by: 0,
    //         create_time: 1691342859,
    //         custom_fields: {
    //         awb: "10007616333616",
    //         },
    //         promo_order_detail: {
    //         order_id: 1637503258,
    //         total_cashback: 552,
    //         total_discount: 0,
    //         total_discount_product: 0,
    //         total_discount_shipping: 0,
    //         total_discount_details: null,
    //         summary_promo: [
    //             {
    //             name: "Promo Cashback BFMG29367",
    //             is_coupon: false,
    //             show_cashback_amount: true,
    //             show_discount_amount: true,
    //             cashback_amount: 552,
    //             cashback_points: 552,
    //             cashback_details: [
    //                 {
    //                 amount_points: 552,
    //                 amount_idr: 552,
    //                 actual_amount_idr: 0,
    //                 actual_amount_points: 0,
    //                 currency_type: "gopay_coins",
    //                 currency_type_str: "GoPay Coins",
    //                 budget_details: [
    //                     {
    //                     budget_type: 1,
    //                     benefit_amount: 552,
    //                     actual_benefit_amount: 0,
    //                     },
    //                 ],
    //                 },
    //             ],
    //             type: "cashback",
    //             discount_amount: 0,
    //             discount_details: null,
    //             invoice_desc: "",
    //             },
    //         ],
    //         },
    //         encryption: {
    //         secret:
    //             "VdPtp0u7qaQQLHQUBVUKEv999TeU2mFKbCvInJ+ck/RnR2RwufGTZJGnlIDKQ5C8W/088txsiE88HrZxG9sEmLap5slC3lo9+1Wco1DzUOF4MPvSfkMgfDp6NEaiE73yFRtpkveHfUYMKz6QLLiQUmvAQrtqH8vOIleXMUE6cAGohuNL8n7R41z1E9lq3dzKm9RZBUm0mRaprzwxt960DVxyoq+XOL3rvMslSiXtYSdMIEWHyLlIWXA4l9iZXTFVptXmOp1ricdc1sRSP3q/PZ46FpyOQT7ajrITnbNKRO4eTDqX7uNBFR7F03ZMTe6Msb+ahL9eiMrvQQYNMTIRzw==",
    //         content:
    //             "fV+eeIlMG+xKYdSO4hv5erraOZeXpN3W/9548/LD+izjh1HBhetWw5yKNH/E4PUXuKBWVK82p5FLP5FD+DU+Xq1WCEBrVZmGxu+iNPoygGLGxjM3cDoYu5vFDQPA7aA9X44Vshregk0k8rNfuCQcHTj5MGFHp1gN5IqaZ+7edsjOD1A36Nk8lEQuTp1y+5So1G2AeDjHaCiuGAtbIWaNqaERdn1hFPDoiqxnoc7++ZwwCODcHrBtSp2hLgKKLaYHAlEjOrOfJb6qtoLAaIgxVMozLJyrpjvVo/0KiNyOeXcrZU86LsYJ+RNI4xSEJnP6X6bU0r27dUHfWDZYl6bm25sguWU3zjWXE06HW8ojtr+hPa3Jyz5H",
    //         },
    //         addon_info: null,
    //         shipment_fulfillment: {
    //         accept_deadline: "2023-08-07T23:59:00Z",
    //         confirm_shipping_deadline: "2023-08-08T23:59:00Z",
    //         },
    //         is_plus: false,
    //     },
    //     ];

    // resApi["data"].map(async (element) => {
    //     console.log(element)

    //     let orderNo = generateCustomLengthString(10)+element.order_id

    //     let payloadSO = {
    //         orderno: orderNo,
    //         debtorno: '368',
    //         branchcode: '368',
    //         customerref: element.payment_id,
    //         buyername: element.buyer.name,
    //         comments: element.invoice_ref_num,
    //         orddate: element.payment_date.split("T")[0],
    //         ordertype: "GS",
    //         shipvia: "1",
    //         deladd1: element.recipient.address.address_full,
    //         deladd2: element.recipient.address.district,
    //         deladd3: element.recipient.address.city,
    //         deladd4: element.recipient.address.province,
    //         deladd5: element.recipient.address.postal_code,
    //         deladd6: element.recipient.address.country,
    //         contactphone: element.recipient.phone,
    //         contactemail: 'FishingZone@gmail.com',
    //         deliverto: 'Fishing Zone',
    //         deliverblind: '2',
    //         freightcost: '0',
    //         fromstkloc: 'PST',
    //         deliverydate: element.shipment_fulfillment.accept_deadline.split("T")[0],
    //         confirmeddate: element.shipment_fulfillment.confirm_shipping_deadline.split("T")[0],
    //         printedpackingslip: '1',
    //         datepackingslipprinted: element.shipment_fulfillment.accept_deadline.split("T")[0],
    //         quotation: '0',
    //         quotedate:  element.shipment_fulfillment.accept_deadline.split("T")[0],
    //         poplaced: '0',
    //         salesperson: 'P21',
    //         userid: 'nurul'
    //     }

    //     let insertSO = await salesorders.create(payloadSO);

    //     console.log( {insertSO:insertSO });

    //     let i = 1;
    
    //     element.products.map(async(product) => {
    //         console.log(product)
    //         let payloadSOD = {
    //             orderlineno: generateCustomLengthString(4),
    //             orderno: orderNo,     
    //             koli:'',
    //             stkcode: product.id,
    //             qtyinvoiced:'1',
    //             unitprice:product.price,
    //             quantity:product.quantity,
    //             estimate:0,
    //             discountpercent:(parseInt(element.promo_order_detail.total_discount_product)/(+product.price*+product.quantity))*100,
    //             discountpercent2:(parseInt(element.promo_order_detail.total_discount_shipping)/(+product.price*+product.quantity))*100,
    //             actualdispatchdate: element.shipment_fulfillment.confirm_shipping_deadline.split("T")[0],
    //             completed:'0',
    //             narrative:'',
    //             itemdue: element.shipment_fulfillment.accept_deadline.split("T")[0],
    //             poline:0,
        
    //         }
        
    //         let insertSOD = await salesorderdetails.create(payloadSOD);

    //         console.log( {insertSOD:insertSOD })
    //         i++;
    //     })
    // })

    // response.res200(res, "000", "Generate Success", { fromTime:fromTime, toTime: toTime, token: res.locals.token, response: resApi.data })

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://fs.tokopedia.net/v2/order/list?fs_id='+FS_ID+'&shop_id='+SHOP_ID+'&from_date='+fromTime+'&to_date='+toTime+'&page=1&per_page=1',
        headers: { 
          'Authorization': 'Bearer '+res.locals.token
        }
      };
      
    return await axios.request(config)
      .then(async(resApi) => {

        console.log(JSON.stringify(resApi.data));
        resApi["data"].data.map(async (element) => {
            console.log(element)
    
            let orderNo = generateCustomLengthString(10)+element.order_id
    
            let payloadSO = {
                orderno: orderNo,
                debtorno: '368',
                branchcode: '368',
                customerref: element.payment_id,
                buyername: element.buyer.name,
                comments: element.invoice_ref_num,
                orddate: element.payment_date.split("T")[0],
                ordertype: "GS",
                shipvia: "1",
                deladd1: element.recipient.address.address_full,
                deladd2: element.recipient.address.district,
                deladd3: element.recipient.address.city,
                deladd4: element.recipient.address.province,
                deladd5: element.recipient.address.postal_code,
                deladd6: element.recipient.address.country,
                contactphone: element.recipient.phone,
                contactemail: 'FishingZone@gmail.com',
                deliverto: 'Fishing Zone',
                deliverblind: '2',
                freightcost: '0',
                fromstkloc: 'PST',
                deliverydate: element.shipment_fulfillment.accept_deadline.split("T")[0],
                confirmeddate: element.shipment_fulfillment.confirm_shipping_deadline.split("T")[0],
                printedpackingslip: '1',
                datepackingslipprinted: element.shipment_fulfillment.accept_deadline.split("T")[0],
                quotation: '0',
                quotedate:  element.shipment_fulfillment.accept_deadline.split("T")[0],
                poplaced: '0',
                salesperson: 'P21',
                userid: 'nurul'
            }
    
            let insertSO = await salesorders.create(payloadSO);
    
            console.log( {insertSO:insertSO });
    
            let i = 1;
        
            element.products.map(async(product) => {
                console.log(product)
                let payloadSOD = {
                    orderlineno: generateCustomLengthString(4),
                    orderno: orderNo,     
                    koli:'',
                    stkcode: product.id,
                    qtyinvoiced:'1',
                    unitprice:product.price,
                    quantity:product.quantity,
                    estimate:0,
                    discountpercent:(parseInt(element.promo_order_detail.total_discount_product)/(+product.price*+product.quantity))*100,
                    discountpercent2:(parseInt(element.promo_order_detail.total_discount_shipping)/(+product.price*+product.quantity))*100,
                    actualdispatchdate: element.shipment_fulfillment.confirm_shipping_deadline.split("T")[0],
                    completed:'0',
                    narrative:'',
                    itemdue: element.shipment_fulfillment.accept_deadline.split("T")[0],
                    poline:0,
            
                }
            
                let insertSOD = await salesorderdetails.create(payloadSOD);
    
                console.log( {insertSOD:insertSOD })
                i++;
            })
        })

        response.res200(res, "000", "Generate Success", { fromTime:fromTime, toTime: toTime, token: res.locals.token, response: resApi.data })

      })
      .catch((error) => {
        console.log(error)
      });

    // let payload = {
    //     orderlineno:'4',
    //     orderno:'100005',     
    //     koli:'',
    //     stkcode:'036282084651',
    //     qtyinvoiced:'2',
    //     unitprice:'1111',
    //     quantity:'2',
    //     estimate:'0',
    //     discountpercent:'0',
    //     discountpercent2:'0',
    //     actualdispatchdate: new Date(),
    //     completed:'1',
    //     narrative:'',
    //     itemdue: moment(new Date()).format("YYYY-MM-DD"),
    //     poline:0,

    // }

    // let insert = await salesorderdetails.create(payload);

    // response.res200(res, "000", "Generate Success", { fromTime:fromTime, toTime: toTime, insert: insert })
}