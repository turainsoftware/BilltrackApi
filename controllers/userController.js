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
    const userId = req.params.id;

    try {
        const [userExists] = await db.query("SELECT * FROM user WHERE user_id = ?", [userId]);
        if (userExists.length === 0) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        const allowedFields = [
            "name", "contact_no1", "contact_no2", "whatsapp_no",
            "email", "user_name", "login_status", "user_role_id"
        ];

        const userData = req.body;

        if (Array.isArray(userData.user_role_id)) {
            userData.user_role_id = userData.user_role_id.join(',');
        }

        const errors = [];

        if ('name' in userData && typeof userData.name !== 'string') {
            errors.push("Name must be a string");
        }

        const phoneRegex = /^[0-9]{10}$/;
        ["contact_no1", "contact_no2", "whatsapp_no"].forEach(field => {
            if (field in userData && !phoneRegex.test(userData[field])) {
                errors.push(`${field} must be a valid 10-digit number`);
            }
        });

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if ('email' in userData && !emailRegex.test(userData.email)) {
            errors.push("Invalid email format");
        }

        if ('user_name' in userData && typeof userData.user_name !== 'string') {
            errors.push("User name must be a string");
        }

        if ('login_status' in userData && ![0, 1].includes(Number(userData.login_status))) {
            errors.push("Login status must be 0 or 1");
        }

        if ('user_role_id' in userData && typeof userData.user_role_id !== 'string') {
            errors.push("User role ID must be a string (comma-separated if multiple)");
        }

        // Check for duplicate contact_no1 if it's being updated
        if ('contact_no1' in userData) {
            const [duplicateCheck] = await db.query(
                "SELECT user_id FROM user WHERE contact_no1 = ? AND user_id != ?",
                [userData.contact_no1, userId]
            );
            if (duplicateCheck.length > 0) {
                errors.push("Contact No1 already exists for another user");
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ status: false, message: "Validation errors", errors });
        }

        const validUserData = Object.entries(userData).filter(
            ([key]) => allowedFields.includes(key)
        );

        if (validUserData.length === 0) {
            return res.status(400).json({ status: false, message: "No valid fields to update" });
        }

        const fields = validUserData.map(([key]) => `${key} = ?`).join(", ");
        const values = validUserData.map(([, value]) => value);

        const updateQuery = `UPDATE user SET ${fields} WHERE user_id = ?`;

        await db.query(updateQuery, [...values, userId]);

        res.json({
            status: true,
            message: "User updated successfully",
            userId,
            updatedData: Object.fromEntries(validUserData)
        });

    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};













module.exports = { profile, my_profile, user_details_list, add_user_details, update_user_details }
