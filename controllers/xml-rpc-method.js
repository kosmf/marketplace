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

exports.insertSO = async (payload) => {
  const client = xmlrpc.createClient({
    host: 'office.sm-group.co.id',
    port: 80,
    path: '/api/api_xml-rpc.php'
  });

  const salesOrderHeader = payload;

  try {
    const result = await new Promise((resolve, reject) => {
      client.methodCall('weberp.xmlrpc_InsertSalesOrderHeader', [salesOrderHeader, 'admin', 'zhalfa12'], (error, value) => {
        if (error) {
          const errorMessage = 'Error while inserting sales order header:';
          console.error(errorMessage, error);
          reject(error);
        } else {
          console.log('Sales order header inserted successfully.');
          console.log("Success insert SO:", value);
          resolve(value);
        }
      });
    });

    return result;
  } catch (error) {
    console.error('Error:', error);
    return "gagal";
  }
};

exports.insertSOD = async (payload) => {
  const client = xmlrpc.createClient({
    host: 'office.sm-group.co.id',
    port: 80,
    path: '/api/api_xml-rpc.php'
  });

  const salesOrderLine = payload;

  try {
    const result = await new Promise((resolve, reject) => {
      client.methodCall('weberp.xmlrpc_InsertSalesOrderLine', [salesOrderLine, 'admin', 'zhalfa12'], (error, value) => {
        if (error) {
          const errorMessage = 'Error while inserting sales order line:';
          console.error(errorMessage, error);
          reject(error);
        } else {
          console.log('Sales order line inserted successfully.');
          console.log("Success insert SOD:", value);
          resolve(value);
        }
      });
    });

    return result;
  } catch (error) {
    console.error('Error:', error);
    return "Error";
  }
};