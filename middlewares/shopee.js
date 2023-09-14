const axios = require('axios');
const crypto = require('crypto');
const response = require("@Components/response")
const { SHOPEE_CODE } = process.env

exports.tokenAuth = async (req,res,next) => {

  const host = 'https://partner.shopeemobile.com';
  const partnerId = 2006477;
  const partnerKey = '644c6d6f4675576c646f7079616f51655052757643484a7876636c437a707552';
  const shopId = 308454744;
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

  const tokenAuth = await axios.post(url, body, { headers })
    .then((response) => {
      console.log({ response: response});
      if(response.data.access_token){

        res.locals.tokenAuth = response.data
        return 1;
      }

      return 0;
  })
  .catch((error) => {

    console.log(error);
    return 0;
  });;


  if(!tokenAuth) return response.res500(res, "Error During get token tokopedia");

  return next();
};
