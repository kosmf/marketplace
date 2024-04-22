const cron = require('node-cron');
const { Op } = require('sequelize');
const response = require("@Components/response")
const Lazada = require('@Controllers/Lazada')
const Shopee = require('@Controllers/Shopee')
const Tiktok = require('@Controllers/Tiktok')
const Tokopedia = require('@Controllers/Tokopedia')
const { salesorderdetails, salesorders, debtorsmaster, custbranch, log_marketplace, log_rpc } = require("@Configs/database")

let cronJobs = []; // Array to store cron jobs

// Define your async task function
const myTask = async (cronStart) => {
    try {
        console.log("Task Running at " + cronStart);

        const debtOrsmaster = await debtorsmaster.findAll({
            raw: true,
            where: {
                [Op.and]: [
                    // { marketplace: 'Shopee' },
                    // { marketplace: { [Op.not]: 'Tokopedia' } },
                    { active: '1' }
                ]
            }
        });
        

        const refreshAndGetOrder = async (marketplace, sellerId) => {
            let refreshToken, getOrder;

            if (marketplace === 'Lazada') {
                refreshToken = await Lazada.refreshTokenInternal(sellerId);
                getOrder = await Lazada.getOrderListInternal(sellerId);
            } else if (marketplace === 'Shopee') {
                refreshToken = await Shopee.refreshTokenInternal(sellerId);
                getOrder = await Shopee.getOrderListInternal(sellerId);
            } else if (marketplace === 'TikTok') {
                refreshToken = await Tiktok.refreshTokenInternal(sellerId);
                getOrder = await Tiktok.getOrderListInternal(sellerId);
            } else if (marketplace === 'Tokopedia') {
                refreshToken = await Tokopedia.getTokenInternal(sellerId);
                getOrder = await Tokopedia.getOrderListInternal(sellerId);
            }

            console.log({ refreshTokenCron: refreshToken, getOrderCron: getOrder });
            return getOrder?.success;
        };

        for (const shop of debtOrsmaster) {
            try {
                let maxLoop = 5;
                for (let i = 0; i < maxLoop; i++) {
                    const success = await refreshAndGetOrder(shop.marketplace, shop.idseller);

                    if (success) break;

                    console.log("Retry: " + (i + 1));
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.error('Error refreshing token:', error);
                // Handle error if needed
            }
        }

        console.log("Task Running at " + new Date().toLocaleString());
    } catch (error) {
        console.error('Error in task:', error);
    }
};

// Define the cron expressions for each task
const cronExpressions = [
    // '* * * * *' // Run every minute
    // '5 0 * * *', // 00:05 AM
    // '10 0 * * *', // 00:10 AM
    // '15 0 * * *', // 00:15 AM
    // '20 0 * * *', // 00:20 AM
    '00 23 * * *',  // 00:25 AM
    '00 22 * * *', // 10:00 AM
    '05 21 * * *', // 03:00 PM
    // '7 11 * * *'  // 10:00 PM
];

exports.startCron = async(req, res) => {
    response.res200(res, "000", "Cronjob Start "+new Date(), {})

    // Create and schedule cron jobs for the task with each cron expression
    for (let i = 0; i < cronExpressions.length; i++) {
        const job = cron.schedule(cronExpressions[i], async () => myTask(cronExpressions[i]), { // Pass a function reference to myTask
            scheduled: true,
            timezone: 'Asia/Jakarta' // Change this to your timezone
        });

        cronJobs.push(job); // Store the cron job in the array
        job.start();
    }

}

exports.stopCron = async (req, res) => {

    const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });

    console.log("Cronjob Stopped : "+now)
    // Stop all running cron jobs
    cronJobs.forEach(job => {
        job.stop();
    });

    // Clear the cronJobs array
    cronJobs = [];

    return response.res200(res, "000", "Cronjob Stopped", {});
};
