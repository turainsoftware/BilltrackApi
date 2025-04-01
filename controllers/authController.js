const db = require('../config/dbConnection');
const web_services = require('../services/web_services'); 
const { generateToken } = require('../services/JwtService');
const { generateOTP } = require('../utils/utils');


const chk_username = async (req, res) => {
    try {
        const contact_no1 = req.body.contact_no1 || req.query.contact_no1;

        if (!contact_no1) {
            return res.status(400).json({ status: false, message: "Phone number is required" });
        }

        if (!/^\d{10}$/.test(contact_no1)) {
            return res.status(400).json({ status: false, message: "Invalid phone number format. Please enter a valid 10-digit number." });
        }

        const query = "SELECT * FROM user WHERE contact_no1 = ?";
        const [results] = await db.query(query, [contact_no1]);

        if (results.length > 0) {
            return res.status(200).json({ status: true, message: "Number is valid and registered" });
        } else {
            return res.status(404).json({ status: false, message: "Contact number not registered" });
        }
    } catch (err) {
        return res.status(500).json({ status: false, message: "Database error", error: err.message });
    }
};

const mobile_otp = async (req, res) => {
    try {
        const phone_number = req.query.phone_number;

        if (!phone_number) {
            return res.status(400).json({ status: false, message: 'Phone number is required.' });
        }

        if (!/^\d{10}$/.test(phone_number)) {
            return res.status(400).json({ status: false, message: 'Invalid phone number format. Please enter a valid 10-digit number.' });
        }

        // const otp = Math.floor(1000 + Math.random() * 9000);
        const otp = generateOTP();

        const query = 'SELECT * FROM user WHERE contact_no1 = ?';
        const [userExists] = await db.query(query, [phone_number]);

        const data = {
            mobile_otp: otp,
            contact_no1: phone_number,
            active_status: 1,
            login_status: 1
        };

        if (userExists.length > 0) {
            await db.query('UPDATE user SET ? WHERE contact_no1 = ?', [data, phone_number]);
        } else {
            await db.query('INSERT INTO user SET ?', [data]);
        }

        return res.status(200).json({ status: true, message: 'OTP has been generated successfully', phone_number });
    } catch (err) {
        return res.status(500).json({ status: false, message: 'Database error', error: err.message });
    }
};

const verify_otp = async (req, res) => {
    try {
        const { otp, phoneNumber } = req.query

        // // Fetch user details
        const userDetails = await web_services.select_by_values('user', { contact_no1: phoneNumber });

        if (!userDetails || userDetails.length === 0) {
            return res.json({ status: false, message: 'User not found.' }).status(404);
        }

        const userOtp = userDetails[0].mobile_otp;

        if (userOtp !== otp) {
            return res.json({ status: false, message: 'Invalid OTP.' });
        }
        const token=generateToken({id: userDetails[0].user_id,phoneNumber: userDetails[0].contact_no1})
        res.json({ status: true, token: token });
    } catch (error) {
        res.json({ status: false, message: error.message });
    }
};





module.exports = { chk_username, mobile_otp, verify_otp};
