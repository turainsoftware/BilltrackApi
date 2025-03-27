const db = require("../config/dbConnection");
const web_services = require('../services/web_services');

const todays_sales = async (req, res) => {
    try {
        const user = req.user;

        // Validate user before querying the database
        if (!user || !user.id) {
            return res.status(400).json({ status: false, message: "Invalid User Data" });
        }

        // Query to fetch user details
        const query = "SELECT company_name_id, type FROM user WHERE user_id = ?";
        const [results] = await db.query(query, [user.id]);

        if (results.length === 0) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        const company_name_id = results[0].company_name_id;
        const user_type = results[0].type;
        const user_id = user.id;

        // Get today's date in 'YYYY-MM-DD' format
        const today = new Date().toISOString().split("T")[0];

        // Define filter criteria for today's sales
        let today_values = {
            "shop_invoice.company_name_id": company_name_id,
            "shop_invoice.payment_status": 1,
            "shop_invoice.payment_date": today,
            "shop_invoice.cancel_status": 0
        };

        if (user_type !== "A") {
            today_values["shop_invoice.user_id"] = user_id;
        }

        // Fetch today's total revenue
        const today_bill = await web_services.get_total_invoice_value_customer_details(
            "SUM(price*qty) AS today_bill",
            "shop_invoice",
            today_values
        );

        return res.json(today_bill);

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

const total_revenue = async (req, res) => {
    try {
        const user = req.user;

        if (!user || !user.id) {
            return res.status(400).json({ status: false, message: "Invalid User Data" });
        }

        const query = "SELECT company_name_id, type FROM user WHERE user_id = ?";
        const [results] = await db.query(query, [user.id]);


        if (results.length === 0) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        const company_name_id = results[0].company_name_id;

        const user_type = results[0].type;
        const user_id = user.id;

        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        let financial_year;
        if (currentMonth >= 4 && currentMonth <= 12) {
            financial_year = `${currentYear.toString().slice(-2)}${(currentYear + 1).toString().slice(-2)}`;
        } else {
            financial_year = `${(currentYear - 1).toString().slice(-2)}${currentYear.toString().slice(-2)}`;
        }

        let financial_year_values = {
            "shop_invoice.company_name_id": company_name_id,
            "shop_invoice.payment_status": 1,
            "shop_invoice.financial_year": financial_year,
            "shop_invoice.cancel_status": 0
        };

        if (user_type !== "A") {
            financial_year_values["shop_invoice.user_id"] = user_id;
        }

        const financial_year_bill = await web_services.get_total_invoice_value_customer_details(
            "SUM(price*qty) AS financial_year_bill",
            "shop_invoice",
            financial_year_values
        );

        return res.json(financial_year_bill);

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

const total_invoice = async (req, res) => {
    try {
        const user = req.user;

        // Validate user before querying the database
        if (!user || !user.id) {
            return res.status(400).json({ status: false, message: "Invalid User Data" });
        }

        // Query to fetch user details
        const query = "SELECT company_name_id, type FROM user WHERE user_id = ?";
        const [results] = await db.query(query, [user.id]);

        if (results.length === 0) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        const company_name_id = results[0].company_name_id;
        const user_type = results[0].type;
        const user_id = user.id;

        let invoiceQuery;
        let queryParams;

        if (user_type === 'A') {
            invoiceQuery = "SELECT COUNT(*) AS total FROM shop_invoice WHERE company_name_id = ? AND payment_status = 1";
            queryParams = [company_name_id];
        } else {
            invoiceQuery = "SELECT COUNT(*) AS total FROM shop_invoice WHERE company_name_id = ? AND payment_status = 1 AND user_id = ?";
            queryParams = [company_name_id, user_id];
        }

        // Fetch invoice count
        const [invoiceResults] = await db.query(invoiceQuery, queryParams);

        return res.json(
            invoiceResults[0].total,
      );

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

const total_customer = async (req, res) => {
    try {
        const user = req.user;

        // Validate user before querying the database
        if (!user || !user.id) {
            return res.status(400).json({ status: false, message: "Invalid User Data" });
        }

        // Query to fetch user details
        const query = "SELECT company_name_id, type FROM user WHERE user_id = ?";
        const [results] = await db.query(query, [user.id]);

        if (results.length === 0) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        const company_name_id = results[0].company_name_id;
        const user_type = results[0].type;
        const user_id = user.id;

        let customerQuery;
        let queryParams;

        if (user_type === 'A') {
            customerQuery = "SELECT COUNT(*) AS total FROM customer_details WHERE company_name_id = ?";
            queryParams = [company_name_id];
        } else {
            customerQuery = "SELECT COUNT(*) AS total FROM customer_details WHERE company_name_id = ? AND user_id = ?";
            queryParams = [company_name_id, user_id];
        }

        // Fetch customer count
        const [customerResults] = await db.query(customerQuery, queryParams);

        return res.json({
            status: true,
            total_customers: customerResults[0].total,
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

const invoice_details_list = async (req, res) => {
    try {
        const user = req.user;

        // Validate user before querying the database
        if (!user || !user.id) {
            return res.status(400).json({ status: false, message: "Invalid User Data" });
        }

        // Query to fetch user details
        const query = "SELECT type, company_name_id FROM user WHERE user_id = ?";
        const [results] = await db.query(query, [user.id]);

        if (results.length === 0) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        const { type, company_name_id } = results[0];

        // Define query based on user type
        let invoice_list_query;
        let queryParams;

        if (type === 'A') {
            // Admin: Fetch all invoices for the company
            invoice_list_query = `
                SELECT cancel_status, shop_invoice_id, invoice_number, 
                    DATE_FORMAT(invoice_date, '%Y-%m-%d') AS invoice_date, 
                    customer_name, contact_no 
                FROM shop_invoice 
                WHERE company_name_id = ? AND payment_status = 1
                ORDER BY shop_invoice_id DESC 
                LIMIT 10`;
            queryParams = [company_name_id];
        } else {
            // Regular user: Fetch only user's invoices
            invoice_list_query = `
                SELECT cancel_status, shop_invoice_id, invoice_number, 
                    DATE_FORMAT(invoice_date, '%Y-%m-%d') AS invoice_date, 
                    customer_name, contact_no 
                FROM shop_invoice 
                WHERE company_name_id = ? AND user_id = ? AND payment_status = 1
                ORDER BY shop_invoice_id DESC 
                LIMIT 10`;
            queryParams = [company_name_id, user.id];
        }

        // Execute invoice list query
        const [invoice_list] = await db.query(invoice_list_query, queryParams);

        // Fetch total amount for each invoice
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
        }

        // Send response
        res.status(200).json({
            invoices: invoice_list
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};










  

module.exports = { total_revenue, todays_sales, total_invoice, total_customer,invoice_details_list };
