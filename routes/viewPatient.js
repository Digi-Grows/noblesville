const express = require('express');
const sql_conn = require('../db');
const route = express.Router();

route.get('/id/:id', (req, res) => {
  if (req.session.loggedIn) {
    const patient_id = req.params.id;
    // const select_id_data = `SELECT * FROM PATIENT_INFO WHERE PATIENT_ID = '${patient_id}'`;
    // const select_id_data = `SELECT DATE_FORMAT(UTC, '%Y-%m-%d') AS DAY, TIME_FORMAT(UTC, '%H:%i:%s') AS TIME_STAMP, ID, PRESCRIBER_NAME, PATIENT_EMAIL, PATIENT_FIRSTNAME, PATIENT_LASTNAME, PHONE_NO, PATIENT_ID, DATE, MONTH, YEAR, SIZE, MED_TYPE, GENDER, DOCFILE, MEDICINE, REFILLS FROM PATIENT_INFO WHERE PATIENT_ID = '${patient_id}'`;

    const select_id_data = `SELECT DATE_FORMAT(UTC, '%Y-%m-%d') AS DAY, TIME_FORMAT(UTC, '%H:%i:%s') AS TIME_STAMP, ID, PRESCRIBER_NAME, PATIENT_EMAIL, PATIENT_FIRSTNAME, PATIENT_LASTNAME, PHONE_NO, PATIENT_ID, DATE, MONTH, YEAR, SIZE, MED_TYPE, GENDER, DOCFILE, MEDICINE, REFILLS FROM PATIENT_INFO WHERE PATIENT_ID = '${patient_id}' ORDER BY DAY DESC, TIME_STAMP DESC`;
    
    const select_patient_data = `SELECT DATE_FORMAT(UTC, '%Y-%m-%d') AS DAY, TIME_FORMAT(UTC, '%H:%i:%s') AS TIME_STAMP, ID, PRESCRIBER_NAME, EMAIL, FIRST_NAME as PATIENT_FIRSTNAME, LAST_NAME as PATIENT_LASTNAME, PHONENO AS PHONE_NO, ID AS PATIENT_ID, DAY as DATE, MONTH, YEAR, GENDER FROM PATIENTS_RECORDS WHERE ID = '${patient_id}' ORDER BY TIME_STAMP DESC`;

    const physician_id = req.session.prescriberID;
    let physician_details = `SELECT NPI, FIRST_NAME, LAST_NAME, CONTACT FROM REGISTERED_PRESCRIBER WHERE ID = ?`;


    sql_conn.query(physician_details, [physician_id], async (err, physician_details) => {
        if(err) {
            console.log('Error in retreiving doctor details');
            return;
        }

        await sql_conn.query(select_id_data, async (err, result) => {
          if (err) throw err;

          if(result.length > 0){
            await res.render('view_patient', {
              result: result,
              detail : physician_details[0]
            });
          } else {
            
            await sql_conn.query(select_patient_data, async (err, patient) => {
              if (err) throw err;

              await res.render('view_patient', {
                result: patient,
                detail : physician_details[0]
              });
            });

          }
        });
      });
  }
  else {
    res.redirect('/login');
  }
});

module.exports = route;
