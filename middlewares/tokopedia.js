const axios = require('axios');
const response = require("@Components/response")
const { TOKPED_ACCOUNT } = process.env

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
