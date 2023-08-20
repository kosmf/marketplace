const axios = require('axios');
const response = require("@Components/response")
const { TOKPED_ACCOUNT, FS_ID } = process.env

exports.getToken = async (req,res,next) => {

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://accounts.tokopedia.com/token?grant_type=client_credentials',
    headers: { 
      'Authorization': 'Basic '+TOKPED_ACCOUNT
    }
  };

  // request token to tokopedia
  let reqToken = await axios.request(config)
  .then((response) => {

    console.log({ response: response});
    if(response.data.access_token){

      res.locals.token = response.data.access_token
      return 1;
    }

    return 0;
  })
  .catch((error) => {

    console.log(error);
    return 0;
  });

  if(!reqToken) return response.res500(res, "Error During get token tokopedia");

  return next();
};

exports.getShop = async (req, res) => {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://fs.tokopedia.net/v1/shop/fs/"+FS_ID+"/shop-info",
    headers: {
      Authorization: "Bearer "+res.locals.token,
    },
  };

  let shopList = await axios.request(config)
    .then(({ data: resApi }) => {
      res.locals.shop = resApi["response"]["data"];
      return 1;
    })
    .catch((error) => {
      console.log(error);
      return 0;
    });

    if(!shopList) return response.res500(res, "Error During get shop tokopedia");

    return next();
};