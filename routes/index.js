import { handleAsyncWrapper } from '../services/request_handle_wrapper';
import config from '../services/config';
import subscriptionSdk from '../services/subscription';
// import finalizedAdminSdk from '../services/admin';
// import dynamoDBSdk from '../services/dynamoDB';

const cookieParser = require('cookie-parser');
const express = require('express');
const router = express.Router();
const cors = require('cors');

const whitelist = [
  'https://test.theseafarers.shop',
  'https://test.ship.shop',
  'https://ship.shop',
  'https://www.ship.shop',
  'https://api.ship.shop',
  'https://api-test.theseafarers.shop',
  "https://theseafarers.shop",
  "https://www.theseafarers.shop",
  "https://api.theseafarers.shop",
  'https://journeyh.io',
  'http://localhost:3000',
  'https://flex-console.sharetribe.com',
];


const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 ||
      typeof origin === "undefined") {
      callback(null, true)
    } else {
      console.log(`Not allowed origin ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

router.use(cors(corsOptions));

/* For testing server is alive */
router.get('/', handleAsyncWrapper(async (req, res, next) => {
  return res.status(200).send({
    message: 'ok'
  });
}, { retries: config.retries }));

router.use('/v1', require('./flex'));

router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(cookieParser());
router.use('/api', require('./api'));

// subscriptionSdk.plan.query().then(data => console.log(data))
// subscriptionSdk.speculate({
//   customerId: '5fd73751-aba5-4623-822e-e4e36cd0359e',
//   params: {
//     lineItems: [
//       {
//         pricingId: "price_1Hp3WABNEySeilYTkbDmYukU",
//         quantity: 9
//       },
//       {
//         pricingId: "price_1Ht6ZrBNEySeilYTdWs5okay",
//         quantity: 1
//       }
//     ],
//     protectedData: {
//       testAttribute: {
//         test: 1,
//         test2: 2
//       }
//     }
//   }
// })
//   .then(data => {
//     console.log(data)
//   })

// subscriptionSdk.update({
//   customerId: '5fc7117f-3f1d-4fb7-ba73-17e7d5992a7f',
//   params: {
//     lineItems: [
//       {
//         pricingId: "price_1Hp3WABNEySeilYTEGek1Ieq",
//         quantity: 7
//       },
//       {
//         pricingId: "price_1Ht6ZsBNEySeilYTZJ1jUp1r",
//         quantity: 1
//       }
//     ],
//     protectedData: {
//       testAttribute: {
//         test: 1,
//         test2: 2
//       }
//     }
//   }
// })
//   .then(data => {
//     console.log(data)
//   })

// subscriptionSdk.get({
//   id: 'sub_IXTqooK8Um1u2y',
//   include: ['invoices', 'upcomingInvoice']
// })
//   .then(data => {
//     console.log(data)
//   })

// subscriptionSdk.cancel({
//   customerId: '5fc7117f-3f1d-4fb7-ba73-17e7d5992a7f',
// })
//   .then(data => {
//     console.log(data)
//   })

// subscriptionSdk.resume({
//   customerId: '5fc7117f-3f1d-4fb7-ba73-17e7d5992a7f',
// })
//   .then(data => {
//     console.log(data)
//   })

// finalizedAdminSdk.company.enterprise.change({
//   customerId: '5fc7117f-3f1d-4fb7-ba73-17e7d5992a7f',
//   params: {
//     quantity: 9999999
//   }
// })
//   .then(data => {
//     console.log(data)
//   })

// finalizedAdminSdk.company.enterprise.cancel({
//   customerId: '5fc7117f-3f1d-4fb7-ba73-17e7d5992a7f',
// })
//   .then(data => {
//     console.log(data)
//   })

// const dbInstance = dynamoDBSdk(config.aws.dynamodb.tableName);

// dbInstance.scan({
//   startKeyObj: {
//     id: "5f87427c-81ab-40b1-8e6b-971c81aa96c6"
//   }
// })
//   .then(data => {
//     console.log(data)
//   })


module.exports = router;
