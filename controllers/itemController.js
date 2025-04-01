const db = require("../config/dbConnection");

const get_item_list_details = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.id) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid User Data" });
    }

    const query = "SELECT company_name_id, type FROM user WHERE user_id = ?";
    const [results] = await db.query(query, [user.id]);

    if (results.length === 0) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const company_name_id = results[0].company_name_id;

    // Fetch invoices for the financial year
    const item_list_query = `
    SELECT 
        sd.service_category_id, 
        sd.service_name, 
        sd.price, 
        sd.gst_pr, 
        sd.active_status,
        sc.service_category, 
        sc.hsn_code
    FROM 
        service_details sd
    JOIN 
        service_category sc
    ON 
        sd.service_category_id = sc.service_category_id
    WHERE 
        sd.company_name_id = ? 
    AND 
        sd.active_status = 1
`;

const [item_list] = await db.query(item_list_query, [
    company_name_id,
]);

    res.status(200).json({
      item_list,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

  
  

module.exports = { get_item_list_details };
