const axios = require('axios');
const response = require("@Components/response")
const { salesorderdetails, salesorders } = require("@Configs/database")
const moment = require('moment');
const xmlrpc = require('xmlrpc');
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


exports.listMethod = (req, res) => {
  // Create an XML-RPC client
  const client = xmlrpc.createClient({ host: 'office.sm-group.co.id', port: 80, path: '/api/api_xml-rpc.php' });

  // Call the remote method
  client.methodCall('system.listMethods', [], (error, value) => {
    if (error) {
      console.error('Error:', error);

      return response.res200(res, "000", "Success", value);
    } else {
      console.log('Result:', value);

      return response.res200(res, "000", "Success", value);
    }
  });
}

exports.getCapabilities = (req, res) => {
  // Create an XML-RPC client
  const client = xmlrpc.createClient({ host: 'office.sm-group.co.id', port: 80, path: '/api/api_xml-rpc.php' });

  const username = 'marketplace';
  const password = 'kamikaze1';

  const params = [
    [],
    username,
    password
  ];

  // Call the remote method
  client.methodCall('system.getCapabilities', [], (error, value) => {
    if (error) {
      console.error('Error:', error);

      return response.res200(res, "000", "Success", value);
    } else {
      console.log('Result:', value);

      return response.res200(res, "000", "Success", value);
    }
  });
}

exports.methodHelp = (req, res) => {
  // Create an XML-RPC client
  const client = xmlrpc.createClient({ host: 'office.sm-group.co.id', port: 80, path: '/api/api_xml-rpc.php' });

  const methodToDescribe = "weberp.xmlrpc_InsertSalesOrderLine";

  // Call the remote method
  client.methodCall('system.methodHelp', [methodToDescribe], (error, value) => {
    if (error) {
      console.error('Error:', error);

      return response.res200(res, "000", "Success", error);
    } else {
      console.log('Result:', value);

      return response.res200(res, "000", "Success", value);
    }
  });
}

exports.methodSignature = (req, res) => {
  // Create an XML-RPC client
  const client = xmlrpc.createClient({ host: 'office.sm-group.co.id', port: 80, path: '/api/api_xml-rpc.php' });

  const methodToDescribe = "weberp.xmlrpc_InsertSalesOrderLine";

  // Call the remote method
  client.methodCall('system.methodSignature', [methodToDescribe], (error, value) => {
    if (error) {
      console.error('Error:', error);

      return response.res200(res, "000", "Success", error);
    } else {
      console.log('Result:', value);

      return response.res200(res, "000", "Success", value);
    }
  });
}

exports.insertSO = (req, res) => {
  // Create an XML-RPC client
  const client = xmlrpc.createClient({ host: 'office.sm-group.co.id', port: 80, path: '/api/api_xml-rpc.php' });

  const salesOrderHeader = {
    debtorno: "123", //debtorno & branchcode harus sama
    branchcode: "123",
    customerref: 'ABC123',
    buyername: 'John Doe',
    comments: 'This is a comment.',
    orddate: moment(new Date()).format('DD/MM/YYYY'), //order date harus hari ini/kedepan
    ordertype: 'GS',
    shipvia: 1,
    deladd1: '123 Main Street',
    deladd2: 'Anytown, CA 91234',
    deladd3: 'Anytown',
    deladd4: 'Anytown',
    deladd5: 'Anytown',
    deladd6: 'Indonesia',
    contactphone: '(123) 456-7890',
    contactemail: 'sidharta@gmail.com',
    deliverto: 'John Doe',
    deliverblind: 1, //1
    freightcost: 100,
    fromstkloc: "BP", //PUSAT
    poplaced: 0,
    printedpackingslip: 0,
    deliverydate: moment(new Date()).format('DD/MM/YYYY'), //harus maju dr tgl skrng
    confirmeddate: moment(new Date()).format('DD/MM/YYYY'), //harus maju dr tgl skrng
    datepackingslipprinted: moment(new Date()).format('DD/MM/YYYY'), //harus maju dr tgl skrng
    quotedate: moment(new Date()).format('DD/MM/YYYY'), //harus maju dr tgl skrng
    quotation: 0,
    salesperson: 'SHB', //Harus sesuai di DB
  };

  // Call the remote method
  client.methodCall('weberp.xmlrpc_InsertSalesOrderHeader', [salesOrderHeader, 'admin', 'zhalfa12'], (error, value) => {
    if (error) {
      console.error('Error:', error);

      return response.res200(res, "001", "Error", value);
    } else {
      console.log('Result:', value);

      return response.res200(res, "000", "Success", value);
    }
  });
}

exports.insertSOD = (req, res) => {
  // Create an XML-RPC client
  const client = xmlrpc.createClient({ host: 'office.sm-group.co.id', port: 80, path: '/api/api_xml-rpc.php' });

  const salesOrderLine = {
    // orderlineno: 3, incremental, tidak perlu di request
    orderno: "76037",
    koli: '',
    stkcode: '014251140392',
    qtyinvoiced: 0,
    unitprice: 100,
    quantity: 10,
    estimate: 0,
    discountpercent: 0,
    discountpercent2: 0,
    actualdispatchdate: new Date(),
    completed: 0,
    narrative: 'This is a comment.',
    itemdue: '2023-10-28',
    poline: '0',
  };
  
  client.methodCall('weberp.xmlrpc_InsertSalesOrderLine', [salesOrderLine, 'admin', 'zhalfa12'], (error, value) => {
    if (error) {
      console.error('Error:', error);

      return response.res200(res, "001", "Error", error);
    }
  
    // Check the result of the function call
    if (value[0] === 0) {
      // The function call was successful
      console.log('Sales order line inserted successfully.');
      return response.res200(res, "000", "Success", value);
    } else {
      // The function call failed
      const errors = value; // An array of errors
  
      console.error('Error inserting sales order line:', errors);
      return response.res200(res, "001", "Error", errors);
    }
  })
}