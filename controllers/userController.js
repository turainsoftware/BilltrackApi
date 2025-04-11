const { json } = require('express');
const db = require('../config/dbConnection');

const profile = async (req, res) => {
    try {
        const user = req.user; // Extract user data from middleware

        if (!user || !user.id) {
            return res.status(400).json({ status: false, message: "Invalid User Data" });
        }

        // Fetch user details from MySQL using the user ID
        const query = "SELECT  * FROM user WHERE user_id = ?";
        const [results] = await db.query(query, [user.id]);

        // Check if user exists
        if (!results || results.length === 0) {
            return res.status(404).json({ status: false, message: "User Not Found" });
        }

        // Return user data
        res.json({ status: true, user: results[0] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Something went wrong" });
    }
};

const my_profile = async (req, res) => {
    try {
        const user = req.user; // Extract user data from middleware

        if (!user || !user.id) {
            return res.status(400).json({ status: false, message: "Invalid User Data" });
        }

        // Modified query to join user and company_name tables
        const query = `
            SELECT u.name, c.company_name ,c.logo 
            FROM user u
            LEFT JOIN company_name c ON u.company_name_id = c.company_name_id
            WHERE u.user_id = ?
        `;

        // Assuming you're using a database library like mysql2
        const [results] = await db.query(query, [user.id]);
        
        if (!results || results.length === 0) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        return res.status(200).json(
            results[0]
        );

    } catch (error) {
        res.status(500).json({ 
            status: false, 
            message: error.message 
        });
    }
};

const user_details_list = async (req, res) => {
    try {
        const user = req.user;
        if (!user || !user.id) {
            return res.status(400).json({ status: false, message: "Invalid User Data" });
        }

        const query = "SELECT user_id,name,contact_no1,whatsapp_no FROM user WHERE company_name_id = ? AND type = 'B'";
        const [results] = await db.query(query, [user.company_name_id]);

        if (!results || results.length === 0) {
            return res.status(404).json({ status: false, message: "User Not Found" });
        }

        res.json({ users: results });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Something went wrong" });
    }    
};


const add_user_details = async (req, res) => {
    try {
        const user = req.user;

        if (!user || !user.id || !user.company_name_id) {
            return res.status(400).json({ status: false, message: "Invalid User Data" });
        }

        

        const {
            name,
            contact_no1,
            contact_no2,
            whatsapp_no,
            email,
            user_name,
            login_status,
            user_role // Expecting this as an array, e.g., ['1', '2']
        } = req.body;

        if (!name || !contact_no1 || !user_name || !login_status || !user_role) {
            return res.status(400).json({ status: false, message: "Missing Required Fields" });
        }

        const [existingUser] = await db.query("SELECT contact_no1 FROM user WHERE contact_no1 = ?", [contact_no1]);

        if (existingUser.length > 0) {
            return res.status(409).json({ status: false, message: "Contact number already exists" });
        }


        // Regex validators
        const phoneRegex = /^[6-9]\d{9}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!phoneRegex.test(contact_no1)) {
            return res.status(400).json({ status: false, message: "Invalid contact number" });
        }

        if (contact_no2 && !phoneRegex.test(contact_no2)) {
            return res.status(400).json({ status: false, message: "Invalid alternate number" });
        }

        if (whatsapp_no && !phoneRegex.test(whatsapp_no)) {
            return res.status(400).json({ status: false, message: "Invalid WhatsApp number" });
        }

        if (email && !emailRegex.test(email)) {
            return res.status(400).json({ status: false, message: "Invalid email address" });
        }

        const user_role_str = Array.isArray(user_role) ? user_role.join(',') : user_role;

        const query = `
            INSERT INTO user (
                type, company_name_id, name, contact_no1, contact_no2,
                whatsapp_no, email, user_name, login_status, user_role_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            'B',
            user.company_name_id,
            name,
            contact_no1,
            contact_no2 || '',
            whatsapp_no || '',
            email || '',
            user_name.toLowerCase(),
            login_status,
            user_role_str
        ];

        await db.query(query, values);

        return res.json({ status: true, message: "User Details Added Successfully" });
    } catch (error) {
        console.error("Error adding user:", error);
        return res.status(500).json({ status: false, message: "Something went wrong" });
    }
};

const update_user_details = async (req, res) => {
    const userId=req.params.id;
    const userData=req.body;

    res.json({userId,userData});

}






module.exports = { profile, my_profile, user_details_list, add_user_details, update_user_details }
