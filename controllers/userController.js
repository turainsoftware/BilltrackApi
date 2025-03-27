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







module.exports = { profile, my_profile }
