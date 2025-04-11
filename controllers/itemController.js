const db = require("../config/dbConnection");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../billing_software_backend_api/media/items");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
    const extName = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed!"));
    }
  },
}).single("txt_image");

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

    const [item_list] = await db.query(item_list_query, [company_name_id]);

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


const add_item_details = async (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ status: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ status: false, message: err.message });
    }

    try {
      const user = req.user;

      if (!user || !user.id) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid User Data" });
      }

      const [userResult] = await db.query(
        "SELECT company_name_id FROM user WHERE user_id = ?",
        [user.id]
      );

      if (!userResult.length) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }

      const company_name_id = userResult[0].company_name_id;

      const {
        ddl_product_category,
        txt_product_name,
        txt_price,
        txt_gst_per,
        gst_cat_id,
        description,
        hsn_code,
      } = req.body;

      const gstPercentage = parseFloat(txt_gst_per);
      if (isNaN(gstPercentage)) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid GST percentage format" });
      }

      const [gstResults] = await db.query(
        "SELECT product_gst_id, gst FROM product_gst WHERE gst = ?",
        [gstPercentage]
      );

      if (!gstResults.length) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid GST percentage" });
      }

      const gst_prod_id = gstResults[0].product_gst_id;
      const gst_pr = gstResults[0].gst;

      const image = req.file ? req.file.filename : null;

      // Check for duplicate service name under same category and company
      const [duplicateCheck] = await db.query(
        `SELECT * FROM service_details 
         WHERE company_name_id = ? 
         AND service_category_id = ? 
         AND service_name = ?`,
        [company_name_id, ddl_product_category, txt_product_name]
      );

      if (duplicateCheck.length > 0) {
        return res.status(409).json({
          status: false,
          message: "Duplicate entry: Service name already exists under the selected category",
        });
      }

      const data = {
        company_name_id,
        service_category_id: ddl_product_category,
        service_name: txt_product_name,
        price: txt_price,
        image: image,
        gst: txt_gst_per,
        description: description,
        gst_category_id: gst_cat_id,
      };

      const insertQuery = `
  INSERT INTO service_details (
    company_name_id,
    service_category_id,
    service_name,
    image,
    price,
    gst,
    gst_category_id,
    description
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

const [insertResult] = await db.query(insertQuery, [
  data.company_name_id,
  data.service_category_id,
  data.service_name,
  image,
  data.price,
  data.gst,
  data.gst_category_id,
  data.description
]);


      const service_details_id = insertResult.insertId;

      const insertQuery1 = `
        INSERT INTO company_price_history 
        (company_name_id, category_id, service_details_id, service_name, price, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      await db.query(insertQuery1, [
        company_name_id,
        data.service_category_id,
        service_details_id,
        data.service_name,
        data.price,
        new Date().toISOString().split("T")[0],
        "9999-12-31",
      ]);

      res.status(200).json({
        status: true,
        message: "Item details added successfully",
        // insertedId: insertResult.insertId,
        // imageUrl: image ? `/media/item/${image}` : null,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  });
};





module.exports = { get_item_list_details, add_item_details };
