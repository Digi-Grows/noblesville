const sql_conn = require('../db');
const express = require('express');
const route = express.Router();

route.get('/:id', async (req, res) => {
    const patientid = req.params.id;
    const day = req.query.day;
    const time = req.query.time;
    const utc = day + ' ' + time;

    // console.log(patientid+ ' ' + day + ' ' + time);

    const delete_data = `DELETE FROM PATIENT_INFO WHERE PATIENT_ID = ? AND UTC = ?`;

    sql_conn.query(delete_data, [patientid, utc], async (err) => {
        if(err) {
            res.send('Error while deleting Prescription Record');
            return;
        }
        await res.json({success : 'The prescription has been discontinued'})
    })
    // res.json({success : 'The prescription has been discontinued'})
})

module.exports = route;
