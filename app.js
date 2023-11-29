const express = require('express');
const body_parser = require('body-parser');
const path = require('path');
const session = require('express-session');
const sql_conn = require('./db');
const sessionStore = require('./session')
const url = require('url');
const app = express();
const port = 8000;

app.use(session({
    name: 'user%sess%ion',
    secret: 'physician_Hospital',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        // secure : true,
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 86400000,
    }

}));

app.use(body_parser.urlencoded({
    extended: true
}));

app.set('view engine', 'ejs');
app.use(express.json());

app.use(express.static(path.join(__dirname + '/public')));

// CHECKING USER LOGGIN AND RENDER INDEX ELSE RENDER LOGIN
app.get('/', function (req, res) {
    // console.log("Staff ID : " + req.session.staffID);
    if (req.session.loggedIn) {
        const physician_id = req.session.prescriberID;
        let physician_details = `SELECT NPI, FIRST_NAME, LAST_NAME, CONTACT FROM REGISTERED_PRESCRIBER WHERE ID = ?`;

        sql_conn.query(physician_details, [physician_id], async (err, detail) => {
            if (err) {
                console.log('Error in retreiving Physician NPI number and Name');
                return;
            }
            res.render('index', {
                detail: detail[0]
            });
        })

    }
    else {
        res.redirect('/login');
    }
});

// CHECK USER LOGGIN IF LOGIN RENDER INDEX ELSE REGISTER
app.get('/register', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/');
        return;
    }
    else {
        res.render('register');
    }

});

// CHECK IF USER ALREADY LOGGEDIN REDIRECT TO INDEX ELSE RENDER LOGIN
app.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        // console.log(req.sessionID);
        res.redirect('/');
        return;
    }
    else {
        res.render('login');
    }
});

// USER LOGGOUT USING SESSION ID, CLEAR COOKIES FROM THE BROWSER AND REDIRECT TO LOGIN PAGE
app.get('/logout', (req, res) => {
    if (req.session.loggedIn || req.session.staffloggedIn) {
        const sessionid = req.session.id;
        req.sessionStore.destroy(sessionid, (err) => {
            if (err) throw err;
            else {
                res.clearCookie('user%sess%ion');
                res.redirect('/login');
            }
        });
    }
    else {
        res.redirect('/login');
    }
});

// SHOW THE USER (PHYSICIAN) REGISTERED DETAILS IF LOGGEDIN IN EDIT-PROFILE TEMPLATE USING SESSION ID 
// ELSE REDIRECT TO LOGIN
app.get('/edit-profile', (req, res) => {
    if (req.session.loggedIn) {
        const prescriber_id = req.session.prescriberID;
        const precsriber_data = `SELECT * FROM REGISTERED_PRESCRIBER WHERE ID = ?`;

        sql_conn.query(precsriber_data, [prescriber_id], (err, result) => {
            if (err) throw err;

            const data = {
                prescriber_info: result[0]
            };
            res.render('edit-profile', {
                data: data.prescriber_info,
                detail: result[0]
            });
        });
    }
    else {
        res.redirect('/login');
    }
});

// Route to staffPage.js File
app.use('/staff', require('./routes/staffPage'));

// LINK TO RENDER TEMPLATE CREATE-STAFF 
app.get('/create-staff', function (req, res) {
    // res.sendFile(__dirname + '/public/create-staff');
    if (req.session.loggedIn) {
        const physician_id = req.session.prescriberID;
        let physician_details = `SELECT NPI, FIRST_NAME, LAST_NAME, CONTACT FROM REGISTERED_PRESCRIBER WHERE ID = ?`;

        sql_conn.query(physician_details, [physician_id], async (err, physician_details) => {
            if (err) {
                console.log('Error in retreiving doctor details');
                return;
            }

            res.render('create-staff', {
                detail: physician_details[0]
            });
        });
    }
    else {
        res.redirect('/login');
    }
});
app.use('/auth_staff_login', require('./routes/staff_login_verify'))

// LINK TO RENDER CREATE-PATIENT TEMPLATE PAGE
app.get('/create-patient', (req, res) => {
    if (req.session.loggedIn) {
        const physician_id = req.session.prescriberID;
        let physician_details = `SELECT NPI, FIRST_NAME, LAST_NAME, CONTACT FROM REGISTERED_PRESCRIBER WHERE ID = ?`;

        sql_conn.query(physician_details, [physician_id], async (err, physician_details) => {
            if (err) {
                console.log('Error in retreiving doctor details');
                return;
            }
            res.render('create-patient', {
                detail: physician_details[0]
            });
        });
    }
    else {
        res.redirect('/login');
    }
});

// ROUTES TO THE FOLLOWING LINKS
app.use('/', require('./routes/createStaff'));
app.use('/', require('./routes/createPatient'));
app.use('/staff', require('./routes/staff_id'));
app.use('/', require('./routes/searchPatient'));
app.use('/', require('./routes/searchStaff'));
app.use('/auth_register', require('./routes/prescriber_register_auth'));
app.use('/auth_login', require('./routes/prescriber_login_auth'));
app.use('/', require('./routes/next_patient_data'));

// LINK TO CHANGE PASSWORD IF USER LOGGEDIN ELSE REDIRECT TO LOGIN
app.get('/change_password', (req, res) => {
    if (req.session.loggedIn) {
        const physician_id = req.session.prescriberID;
        let physician_details = `SELECT NPI, FIRST_NAME, LAST_NAME, CONTACT FROM REGISTERED_PRESCRIBER WHERE ID = ?`;

        sql_conn.query(physician_details, [physician_id], async (err, physician_details) => {
            if (err) {
                console.log('Error in retreiving doctor details');
                return;
            }
            res.render('change-password', {
                detail: physician_details[0]
            });
        });
    }
    else {
        res.redirect('/login');
    }
});

// ROUTE TO EDIT PROFILE
app.use('/', require('./routes/editProfile'));

// LINK TO CREATE MEDICINE TEMPLATE
app.get('/create', (req, res) => {
    if (req.session.loggedIn) {
        const physician_id = req.session.prescriberID;
        let physician_details = `SELECT NPI, FIRST_NAME, LAST_NAME, CONTACT FROM REGISTERED_PRESCRIBER WHERE ID = ?`;

        sql_conn.query(physician_details, [physician_id], async (err, physician_details) => {
            if (err) {
                console.log('Error in retreiving doctor details');
                return;
            }
            res.render('create', {
                detail: physician_details[0]
            });
        });
    }
    else {
        res.redirect('/login');
    }
});

// ROUTE TO CREATE MEDICINE
app.use('/', require('./routes/create'));

// LINK TO RENDER MEDICINE TEMPLATE 
app.get('/medicine', (req, res) => {
    if (req.session.loggedIn) {
        const physician_id = req.session.prescriberID;
        let physician_details = `SELECT NPI, FIRST_NAME, LAST_NAME, CONTACT FROM REGISTERED_PRESCRIBER WHERE ID = ?`;

        sql_conn.query(physician_details, [physician_id], async (err, physician_details) => {
            if (err) {
                console.log('Error in retreiving doctor details');
                return;
            }
            res.render("medicine", {
                detail: physician_details[0]
            });
        });
    }
    else {
        res.redirect('/login');
    }
});

// ROUTES TO FOLLOWING LINKS
app.use('/submit', require('./routes/review'));
app.use('/upload_patient_data', require('./routes/patient_stored_info'));

// LINK TO RENDER OTP VALIDATION AFTER REGISTRATION

app.get('/otpValidation', (req, res) => {
    if (req.headers.referer === '' || req.headers.referer === undefined) {
        res.sendStatus(404);
    }
    else if (req.headers.referer === 'http://45.93.139.69:8000/register') {
        const email = req.query.email;

        const select_email = `SELECT EMAIL FROM TEMP_PRESCRIBER WHERE EMAIL = '${email}'`;
        sql_conn.query(select_email, (err, otp_res) => {
            if (err) {
                throw err;
            }
            if (otp_res.length > 0) {
                res.render('otpValidation', {
                    email
                });
            }
            else {
                res.status(404).send("Error 404 not found");
            }
        });
    }
    else {
        res.status(504);
    }
});

// ROUTE TO VERIFY OTP 
app.use('/verifyOTP', require('./routes/verify_otp'));

app.get('/staff-login', (req, res) => {
    sql_conn.query("SELECT EMAIL FROM REGISTERED_PRESCRIBER WHERE ID = ?", [req.session.prescriberID], (err, physician_result) => {
        if (err) {
            throw err;
        }
        if (physician_result.length > 0) {
            res.render('staff-login', {
                physician_email: physician_result[0].EMAIL,
            });
        }
        else {
            res.redirect('/login');
        }

    })
});

app.use('/patient', require('./routes/viewPatient'));
app.use('/resendotp', require('./routes/resendOTP'));

app.use('/download_file', require('./routes/download_docx'));
app.use('/fax', require('./routes/fax_file'));

app.get('/forgot', (req, res) => {
    res.render('forgot_password_email');
});

const fs = require('fs')
const csv = require('csv-parser')

app.get('/product-list', (req, res) => {
    if (req.session.loggedIn) {
        const physician_id = req.session.prescriberID;
        let physician_details = `SELECT NPI, FIRST_NAME, LAST_NAME, CONTACT FROM REGISTERED_PRESCRIBER WHERE ID = ?`;

        sql_conn.query(physician_details, [physician_id], async (err, physician_details) => {
            if (err) {
                console.log('Error in retrieving doctor details');
                return;
            }

            const csvDirectory = path.join(__dirname, 'csv');

            // Function to read and process CSV files
            async function processCSVFiles() {
                await fs.readdir(csvDirectory, (err, files) => {
                    if (err) {
                        console.error('Error reading CSV files directory:', err);
                        return;
                    }

                    const tables = [];

                    files.forEach((file) => {
                        if (file.endsWith('.csv')) {
                            const data = [];

                            // Extract filename without extension
                            const filenameWithoutExtension = path.basename(file, path.extname(file));

                            // Read data from the CSV file
                            fs.createReadStream(path.join(csvDirectory, file))
                                .pipe(csv())
                                .on('data', (row) => {
                                    data.push(row);
                                })
                                .on('end', () => {
                                    tables.push({ filename: filenameWithoutExtension, data });
                                    if (tables.length === files.length) {
                                        createHTMLTables(tables);
                                    }
                                });
                        }
                    });
                });
            }

            async function createHTMLTables(tables) {
                await res.render('product-list', {
                    detail: physician_details[0],
                    tables: tables,
                });
            }

            // Call the function to process CSV files
            processCSVFiles();
        });
    } else {
        res.redirect('/login');
    }
});


app.get('/patient-handout', (req, res) => {
    if (req.session.loggedIn) {
        const physician_id = req.session.prescriberID;
        let physician_details = `SELECT NPI, FIRST_NAME, LAST_NAME, CONTACT FROM REGISTERED_PRESCRIBER WHERE ID = ?`;

        sql_conn.query(physician_details, [physician_id], async (err, physician_details) => {
            if (err) {
                console.log('Error in retreiving doctor details');
                return;
            }
            res.render('patient-handout', {
                detail: physician_details[0]
            });
        });
    } else {
        res.redirect('/login');
    }
});

app.get('/edit-preferences', (req, res) => {
    if (req.session.loggedIn) {
        const physician_id = req.session.prescriberID;
        let physician_details = `SELECT NPI, FIRST_NAME, LAST_NAME FROM REGISTERED_PRESCRIBER WHERE ID = ?`;

        sql_conn.query(physician_details, [physician_id], async (err, physician_details) => {
            if (err) {
                console.log('Error in retreiving doctor details');
                return;
            }

            res.render('edit-preferences', {
                detail: physician_details[0]
            });
        });
    } else {
        res.redirect('/login');
    }
});

app.use('/forgot_changePassword', require('./routes/send_forgot_page'));
app.use('/forgot_password_mail', require('./routes/forgot_password_mail'));
app.use('/resendotp_forgot', require('./routes/resend_forgot_otp'));
app.use('/verifyOTP_forgot', require('./routes/verifyOTP_forgot'));
app.use('/update_password', require('./routes/update_password'));

app.use('/order', require('./routes/order'));

app.use('/edit_new_script', require('./routes/edit_script'));

app.use('/contact_us', require('./routes/patient_list'));
app.use('/mail', require('./routes/mail_patient'));

app.use('/delete_prescription', require('./routes/delete_prescription'))

app.use('/edit_patient/id', require('./routes/editPatient'))

app.listen(port,
    console.log(`Server is running at port ${port}`)
);

module.exports = sql_conn;
