const sql_conn = require('../db')
const express = require('express')
const edit = express.Router()

edit.get('/:id', async (req, res) => {
    if (req.session.loggedIn) {
        const physician_id = req.session.prescriberID;
        let physician_details = `SELECT NPI, FIRST_NAME, LAST_NAME, CONTACT FROM REGISTERED_PRESCRIBER WHERE ID = ?`;

        sql_conn.query(physician_details, [physician_id], async (err, physician_details) => {
            if (err) {
                console.log('Error in retreiving doctor details');
                return;
            }
            const get_patient_id = req.params.id;

            const patient_info = `SELECT FIRST_NAME, LAST_NAME, PHONENO, CITY, _STATE, ZIP, DAY, MONTH, YEAR, EMAIL, GENDER FROM PATIENTS_RECORDS WHERE ID = ? AND PRESCRIBER_ID = ?`;

            sql_conn.query(patient_info, [get_patient_id, physician_id], function async(err, result) {
                if (err) {
                    console.log("Error occured while retreiving patient information");
                    return;
                }
                res.render('editPatient', {
                    detail: physician_details[0],
                    res: result[0]
                });
            })
        });
    } else {
        res.redirect('/login');
    }
})

module.exports = edit;
