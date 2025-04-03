const db = require("../config/dbConnection");

const get_profile_details = async (req, res) => {
  try {
    const user = req.user;

    // Validate user before querying the database
    if (!user || !user.id) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid User Data" });
    }

    // Corrected SQL Query
    const query = `
        SELECT 
            u.type, 
            c.company_name,
            c.company_short_name,
            c.address,
            c.gst_no, 
            c.invoice_prefix,
            u.name, 
            u.email, 
            u.contact_no1,
            u.contact_no2,
            u.whatsapp_no
        FROM user u
        LEFT JOIN company_name c ON u.company_name_id = c.company_name_id
        WHERE u.user_id = ?;
        `;

    const [results] = await db.query(query, [user.id]);

    if (results.length === 0) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    return res.json(results[0]);
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const update_profile_details = async (req, res) => {
    try {
        const user = req.user;

        if (!user || !user.id) {
            return res.status(400).json({ status: false, message: "Invalid User Data" });
        }

        const query = `
            SELECT u.name, c.company_name ,c.logo 
            FROM user u
            LEFT JOIN company_name c ON u.company_name_id = c.company_name_id
            WHERE u.user_id = ?
        `;

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

module.exports = { get_profile_details,update_profile_details };
