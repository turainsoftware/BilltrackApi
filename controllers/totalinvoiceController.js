const db = require("../config/dbConnection");
const web_services = require('../services/web_services');


const total_invoice_list = async (req, res) => {
    try {
        const user = req.user;

        if (!user || !user.id) {
            return res.status(400).json({ status: false, message: "Invalid User Data" });
        }

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        let financialYearStart, financialYearEnd;

        if (currentMonth >= 4 && currentMonth <= 12) {
            financialYearStart = `${currentYear}-04-01`;
            financialYearEnd = `${currentYear + 1}-03-31`;
        } else {
            financialYearStart = `${currentYear - 1}-04-01`;
            financialYearEnd = `${currentYear}-03-31`;
        }

        // Query to fetch user details
        const query = "SELECT type, company_name_id, name FROM user WHERE user_id = ?";
        const [results] = await db.query(query, [user.id]);

        if (results.length === 0) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        const company_name_id = results[0].company_name_id;
        const generated_by = results[0].name;

        // Fetch invoices for the financial year
        const invoice_list_query = `
            SELECT cancel_status,
                shop_invoice_id, 
                invoice_number, 
                DATE_FORMAT(invoice_date, '%Y-%m-%d') AS invoice_date, 
                customer_name, 
                contact_no 
            FROM shop_invoice 
            WHERE user_id = ? 
            AND invoice_date BETWEEN ? AND ?`;

        const [invoice_list] = await db.query(invoice_list_query, [user.id, financialYearStart, financialYearEnd]);

        for (let invoice of invoice_list) {
            const total_amount_query = `
                SELECT 
                    SUM(price * qty) AS total_price, 
                    SUM(service_discount) AS total_discount 
                FROM shop_invoice_product 
                WHERE shop_invoice_id = ?`;

            const [total_amount_result] = await db.query(total_amount_query, [invoice.shop_invoice_id]);

            const total_price = total_amount_result[0]?.total_price || 0;
            const total_discount = total_amount_result[0]?.total_discount || 0;

            invoice.total_amount = total_price - total_discount;
            invoice.total_service_discount = total_discount;
            invoice.actual_amount = total_price;
        }

        // Send response
        res.status(200).json({
            invoices: invoice_list,
            generated_by,
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

const total_invoice_amount_details = async (req, res) => {
    try {
        const user = req.user;

        if (!user || !user.id) {
            return res.status(400).json({ status: false, message: "Invalid User Data" });
        }

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        let financialYearStart, financialYearEnd;

        if (currentMonth >= 4 && currentMonth <= 12) {
            financialYearStart = `${currentYear}-04-01`;
            financialYearEnd = `${currentYear + 1}-03-31`;
        } else {
            financialYearStart = `${currentYear - 1}-04-01`;
            financialYearEnd = `${currentYear}-03-31`;
        }

        const query = "SELECT name FROM user WHERE user_id = ?";
        const [results] = await db.query(query, [user.id]);

        if (results.length === 0) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        // const generated_by = results[0].name;

        const invoice_list_query = `
            SELECT shop_invoice_id 
            FROM shop_invoice 
            WHERE user_id = ? 
            AND invoice_date BETWEEN ? AND ? 
            AND cancel_status = 0`;  // Only fetch valid invoices

        const [invoice_list] = await db.query(invoice_list_query, [user.id, financialYearStart, financialYearEnd]);

        let total_invoice_price = 0;
        let total_invoice_discount = 0;
        let total_invoice_amount = 0;

        for (let invoice of invoice_list) {
            const total_amount_query = `
                SELECT 
                    SUM(price * qty) AS total_price, 
                    SUM(service_discount) AS total_discount 
                FROM shop_invoice_product 
                WHERE shop_invoice_id = ?`;

            const [total_amount_result] = await db.query(total_amount_query, [invoice.shop_invoice_id]);

            const total_price = total_amount_result[0]?.total_price || 0;
            const total_discount = total_amount_result[0]?.total_discount || 0;
            const total_amount = total_price - total_discount;

            // Aggregate totals
            total_invoice_price += total_price;
            total_invoice_discount += total_discount;
            total_invoice_amount += total_amount;
        }

        // Send response without invoice details
        res.status(200).json({
            
                total_price: total_invoice_price,
                total_service_discount: total_invoice_discount,
                total_amount: total_invoice_amount
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};










module.exports = { total_invoice_list,total_invoice_amount_details };