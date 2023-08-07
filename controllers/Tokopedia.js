const axios = require('axios');
const response = require("@Components/response")
const moment = require('moment');
const { FS_ID, SHOP_ID } = process.env

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

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://fs.tokopedia.net/v2/order/list?fs_id='+FS_ID+'&shop_id='+SHOP_ID+'&from_date='+fromTime+'&to_date='+toTime+'&page=1&per_page=10000000',
        headers: { 
          'Authorization': 'Bearer '+res.locals.token
        }
      };
      
    return await axios.request(config)
      .then(async(response) => {

        console.log(JSON.stringify(response.data));
        response.res200(res, "000", "Generate Success", { fromTime:fromTime, toTime: toTime, token: res.locals.token, response: response.data })

      })
      .catch((error) => {
        console.log(error);
      });

    // response.res200(res, "000", "Generate Success", { fromTime:fromTime, toTime: toTime, token: res.locals.token })
}