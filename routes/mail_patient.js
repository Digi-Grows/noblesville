const sql_conn = require('../db')
const express = require('express')
const route = express.Router()

const mailer = require('nodemailer');

const mail_transporter = mailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function Mail_to_pharmacy(email, patient_firstName, patient_lastName, patient_contact, email_text) {
    const mail_opt = {
        from: 'Physician',
        to: email,
        subject: `Patient: ${patient_firstName} ${patient_lastName}, ${patient_contact} - NoblesVille Pharmacy`,
        html: `
        <html>
        <body>
            <p style="font-size: 16px;"> ${email_text} </p>
         </body>
         </html>`,      
    };

    try {
        await mail_transporter.sendMail(mail_opt);

        return {
            success: true,
            message: `Email sent to ${email} successful.`,
        };
    } catch (err) {
        return {
            success: false,
            message: err.message,
        };
    }
}

route.post('/patient/id/:id', async function (req, res) {
    const patient_id = req.params.id;
    // console.log(patient_id);
    console.log(req.body);

const patient_data = `SELECT * from PATIENTS_RECORDS WHERE ID = ?`;

    sql_conn.query(patient_data, [patient_id], async (err, patient_result) => {
        if(err) {
            console.log('Error in getting Patient Information');
            return;
        }

        // console.log(patient_result);

        Mail_to_pharmacy("compounds@noblesvillelowcostpharmacy.com", patient_result[0].FIRST_NAME, patient_result[0].LAST_NAME, patient_result[0].PHONENO, req.body.text)
            .then(result => res.json({success : result.success}))
            .catch(error => console.error(error));

        })

})

module.exports = route;
