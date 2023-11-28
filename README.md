# BACKEND API IPG

## Create model with sequelize
sequelize-auto -h DB_HOST -d DB_NAME -u DB_USER -x DB_PASS -p DB_PORT --dialect postgres -o ./models -t banks channel_callback_logs channel_to_bank channels provider_to_bank providers transactions vas

sequelize-auto -h 202.157.186.30 -d marketplace -u root -x M4rketplace -p 5432 --dialect postgres -o ./models -t custbranch debtorsmaster salesorderdetails salesorders log

## Example
{
    "statusCode": "000",
    "message": "Generate Success",
    "data": {
        "fromTime": 1691946000,
        "toTime": 1692032399,
        "token": "c:l68u3oZ_SlywK8nQ5fxumw",
        "response": {
            "header": {
                "process_time": 0,
                "messages": "Your request has been processed successfully"
            },
            "data": [
                {
                    "fs_id": "",
                    "order_id": 1642977368,
                    "is_cod_mitra": false,
                    "accept_partial": false,
                    "invoice_ref_num": "INV/20230814/MPL/3401120043",
                    "have_product_bundle": false,
                    "products": [
                        {
                            "id": 6887793345,
                            "name": "Kail pancing BKK REEFMASTER jigging light 8070-3X-NP BT | jigging hook - 5/0",
                            "quantity": 3,
                            "notes": "",
                            "weight": 0.02,
                            "total_weight": 0.06,
                            "price": 55000,
                            "total_price": 165000,
                            "currency": "Rp",
                            "sku": "6939067016836",
                            "is_wholesale": false
                        }
                    ],
                    "products_fulfilled": [
                        {
                            "product_id": 6887793345,
                            "quantity_deliver": 3,
                            "quantity_reject": 0
                        }
                    ],
                    "bundle_detail": {
                        "bundle": null,
                        "non_bundle": null,
                        "total_product": 0
                    },
                    "device_type": "",
                    "buyer": {
                        "id": 1781238,
                        "name": "",
                        "phone": "",
                        "email": "",
                        "user_status": 0
                    },
                    "shop_id": 13069412,
                    "payment_id": 2350074641,
                    "payment_date": "2023-08-14T11:02:49Z",
                    "recipient": {
                        "name": "",
                        "phone": "",
                        "address": {
                            "address_full": "",
                            "district": "Baiturrahman",
                            "city": "Kota Banda Aceh",
                            "province": "D.I. Aceh",
                            "country": "Indonesia",
                            "postal_code": "23244",
                            "district_id": 235,
                            "city_id": 19,
                            "province_id": 1,
                            "geo": "5.539819700000001,95.3130065"
                        }
                    },
                    "logistics": {
                        "shipping_id": 11,
                        "sp_id": 0,
                        "district_id": 0,
                        "city_id": 0,
                        "province_id": 0,
                        "geo": "",
                        "shipping_agency": "SiCepat",
                        "service_type": "HALU"
                    },
                    "amt": {
                        "ttl_product_price": 165000,
                        "shipping_cost": 30000,
                        "insurance_cost": 1200,
                        "ttl_amount": 196200,
                        "voucher_amount": 0,
                        "toppoints_amount": 0
                    },
                    "dropshipper_info": {},
                    "voucher_info": {
                        "voucher_code": "",
                        "voucher_type": 0,
                        "voucher_amount": 0
                    },
                    "order_status": 500,
                    "warehouse_id": 12983155,
                    "fulfill_by": 0,
                    "create_time": 1692010912,
                    "custom_fields": {
                        "awb": "005220222761"
                    },
                    "promo_order_detail": {
                        "order_id": 1642977368,
                        "total_cashback": 0,
                        "total_discount": 0,
                        "total_discount_product": 0,
                        "total_discount_shipping": 0,
                        "total_discount_details": null,
                        "summary_promo": null
                    },
                    "encryption": {
                        "secret": "B91CLg455EmLW+SicDNwzplnZ2LDVDloA/QW9Dhqy0YDLLzNfTV0epK3hacN+u/ofyAmgde9AJkv7SUZeMtOyH84H+sLFbGJUCIExNxxk8T/FMSWfyIoqCGVqDGo7LhHd+eMat83EQUrho+zo1uSUoX7g7OptF0e8Bk9NFBhJvPS3HyoF5Je/LCdCPjaVxTM0Eb5mKGxNDuwmAE6+NGrqp9lY6hJL5WECA9YW14y01+lBW9LxJndd9jAhnAZLxrLfYE35GvEOjJaql6eY8gD+12oEJUoT+RengJf+7CZJ6I/AzB4tyF888rAr/us883f3zp98F8s/46j9UlSIWSobw==",
                        "content": "rHPZwGUbDgfR8w2uRBdzXxzrSbqlTPI4iS3wj/33lre7cEKguYiAIvoSzLBjBtB6HVR4aN9fWtaFuHqmPQ0qqOSH+Qt1Iq/2qEN/E6SUQm6gelip2KZq6S7YI2uB0XiRN4aMjWAlEnzzz90A9FKE+D+k0oEy1J3ADG6cqTfqoKoXlXbKh9ORDrc4Hm5sDYyFAiccXZsVLikTZFLNXWNr5Rx388ZnshIbnQmRGaALnq6Y8znk8fo5kfosHibQXHuaeJ4I8ReIoT3GVKF+2gP3HDpXLNdTW3IaLz/L/L5U0ZK4TfKMsi7H/VqUrWYcKYzfFAYt8WvrOnznkYBwr5MAH2EZSPKYVKwWrSgqsK9nvuDFsc0mKk+fkSTz36rePgC1EaiYTM2/AIPzHwo6PGyenxW/uNeInhgSLa3HHZzAAugzTUitO3zRB1ZSjJeQOuyOcvPHeD6uy5qs69h9IbkvRcbEs/oLfo8VmFiE3YT/gg=="
                    },
                    "addon_info": null,
                    "shipment_fulfillment": {
                        "accept_deadline": "2023-08-15T11:02:49Z",
                        "confirm_shipping_deadline": "2023-08-16T11:02:49Z"
                    },
                    "is_plus": false
                },
                {
                    "fs_id": "",
                    "order_id": 1643127009,
                    "is_cod_mitra": false,
                    "accept_partial": false,
                    "invoice_ref_num": "INV/20230814/MPL/3401500876",
                    "have_product_bundle": false,
                    "products": [
                        {
                            "id": 10913642658,
                            "name": "Tas joran HAMMERHEAD FISHING ROD BARREL Hard case - A012 160 Htm",
                            "quantity": 1,
                            "notes": "",
                            "weight": 3,
                            "total_weight": 3,
                            "price": 575000,
                            "total_price": 575000,
                            "currency": "Rp",
                            "sku": "8994784159882",
                            "is_wholesale": false
                        }
                    ],
                    "products_fulfilled": [
                        {
                            "product_id": 10913642658,
                            "quantity_deliver": 1,
                            "quantity_reject": 0
                        }
                    ],
                    "bundle_detail": {
                        "bundle": null,
                        "non_bundle": null,
                        "total_product": 0
                    },
                    "device_type": "",
                    "buyer": {
                        "id": 7744859,
                        "name": "",
                        "phone": "",
                        "email": "",
                        "user_status": 0
                    },
                    "shop_id": 13069412,
                    "payment_id": 2350287117,
                    "payment_date": "2023-08-14T13:39:31Z",
                    "recipient": {
                        "name": "",
                        "phone": "",
                        "address": {
                            "address_full": "",
                            "district": "Bekasi Selatan",
                            "city": "Kota Bekasi",
                            "province": "Jawa Barat",
                            "country": "Indonesia",
                            "postal_code": "17147",
                            "district_id": 2200,
                            "city_id": 167,
                            "province_id": 12,
                            "geo": "-6.277791,106.974725"
                        }
                    },
                    "logistics": {
                        "shipping_id": 23,
                        "sp_id": 0,
                        "district_id": 0,
                        "city_id": 0,
                        "province_id": 0,
                        "geo": "",
                        "shipping_agency": "AnterAja",
                        "service_type": "Same Day"
                    },
                    "amt": {
                        "ttl_product_price": 575000,
                        "shipping_cost": 22500,
                        "insurance_cost": 3600,
                        "ttl_amount": 601100,
                        "voucher_amount": 0,
                        "toppoints_amount": 0
                    },
                    "dropshipper_info": {},
                    "voucher_info": {
                        "voucher_code": "",
                        "voucher_type": 0,
                        "voucher_amount": 0
                    },
                    "order_status": 10,
                    "warehouse_id": 12983155,
                    "fulfill_by": 0,
                    "create_time": 1692020367,
                    "custom_fields": {
                        "awb": "10007651366495"
                    },
                    "promo_order_detail": {
                        "order_id": 1643127009,
                        "total_cashback": 0,
                        "total_discount": 11500,
                        "total_discount_product": 11500,
                        "total_discount_shipping": 0,
                        "total_discount_details": [
                            {
                                "amount": 11500,
                                "type": "discount_product"
                            }
                        ],
                        "summary_promo": [
                            {
                                "name": "Diskon hingga Rp1.000.000",
                                "is_coupon": true,
                                "show_cashback_amount": true,
                                "show_discount_amount": true,
                                "cashback_amount": 0,
                                "cashback_points": 0,
                                "cashback_details": null,
                                "type": "discount",
                                "discount_amount": 11500,
                                "discount_details": [
                                    {
                                        "amount": 11500,
                                        "type": "discount_product",
                                        "budget_details": [
                                            {
                                                "budget_type": 1,
                                                "benefit_amount": 11500,
                                                "actual_benefit_amount": 11500
                                            },
                                            {
                                                "budget_type": 2,
                                                "benefit_amount": 0,
                                                "actual_benefit_amount": 0
                                            },
                                            {
                                                "budget_type": 3,
                                                "benefit_amount": 0,
                                                "actual_benefit_amount": 0
                                            }
                                        ]
                                    }
                                ],
                                "invoice_desc": "CT08RS"
                            }
                        ]
                    },
                    "encryption": {
                        "secret": "B91CLg455EmLW+SicDNwzplnZ2LDVDloA/QW9Dhqy0YDLLzNfTV0epK3hacN+u/ofyAmgde9AJkv7SUZeMtOyH84H+sLFbGJUCIExNxxk8T/FMSWfyIoqCGVqDGo7LhHd+eMat83EQUrho+zo1uSUoX7g7OptF0e8Bk9NFBhJvPS3HyoF5Je/LCdCPjaVxTM0Eb5mKGxNDuwmAE6+NGrqp9lY6hJL5WECA9YW14y01+lBW9LxJndd9jAhnAZLxrLfYE35GvEOjJaql6eY8gD+12oEJUoT+RengJf+7CZJ6I/AzB4tyF888rAr/us883f3zp98F8s/46j9UlSIWSobw==",
                        "content": "KC6mBEXa+AOm5BF0MjlaNUX2QlLOZ8Y5JY1Lg0EnkjIyOvmjOrkByr3eRWJFcqgx6r1cqq5JH8SliOgwpbVH41Jv7oIROKmAsmhlPsDNbfCVAY5T7zMXx2qemRiApXx4P1zTwMCbPCdOuMB74iBZEV0SnlddHc4zhLsEPdtvE0wZKDaJ0i9mll1grjg/YLxKOy/Pvh8JKFKN/jKJjkjCwC6kBC3lxTNcrXJczAoqIhiWqJi9kmbmxngW07Y6pn31/v0ns9Owb6TUJjBVgm8HJAktk8ICgVs4HttU1Xr7M4ZfueJ2qsNoBFJLUnjAAbYmcqriEERBStU2TuR+HFDMbWYdX/uEUC3XcL6ee9NkvHioD4kHQOs60YTVjT1NBu/bZscptnY1FKe7jTwAE2Sm1b3VWUHqNGfaEftb9DMQeO/7ACDgeDA3BDIe1aQ="
                    },
                    "addon_info": null,
                    "shipment_fulfillment": {
                        "accept_deadline": "2023-08-15T07:39:31Z",
                        "confirm_shipping_deadline": "2023-08-15T14:00:00Z"
                    },
                    "is_plus": false
                }
            ]
        }
    }
}