const sql_conn = require('../db');
const express = require('express');
const route = express.Router();

route.get('/', async function (req, res) {
    if (req.session.loggedIn) {
        const physician_id = req.session.prescriberID;
        const patient_list = 'SELECT * FROM PATIENTS_RECORDS WHERE PRESCRIBER_ID = ?';

        sql_conn.query(patient_list, [physician_id], async (err, patient_result) => {
            if(err) {
                console.log('Error in retreiving patient results');
                return;
            }
            res.json({
                list : patient_result
            })

        })
    }
})

module.exports = route;
