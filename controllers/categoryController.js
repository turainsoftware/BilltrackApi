const db = require("../config/dbConnection");


const get_category_list_details = async (req, res) => {
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

    const category_list_query = `
            SELECT service_category_id,service_category,hsn_code,image,gst_per,active_status
            FROM service_category 
            WHERE company_name_id = ? 
            AND active_status = 1`;

    const [category_list] = await db.query(category_list_query, [
      company_name_id,
    ]);

    res.status(200).json({
      category_list,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "../billing_software_backend_api/media/category");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
//   fileFilter: function (req, file, cb) {
//     const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
//     const extName = allowedTypes.test(
//       path.extname(file.originalname).toLowerCase()
//     );
//     const mimeType = allowedTypes.test(file.mimetype);

//     if (extName && mimeType) {
//       return cb(null, true);
//     } else {
//       return cb(new Error("Only images are allowed!"));
//     }
//   },
// }).single("txt_image");

const add_category = async (req, res) => {
    try {
        const user = req.user;
        if (!user || !user.id) {
            return res.status(400).json({ status: false, message: "Invalid User Data" });
        }

        const [userResults] = await db.query(
            "SELECT company_name_id, type FROM user WHERE user_id = ?",
            [user.id]
        );

        if (!userResults.length) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        const company_name_id = userResults[0].company_name_id;
        const { txt_product_category, txt_gst_per, hsn_code } = req.body;

        let missingFields = [];
        if (!txt_product_category) missingFields.push("txt_product_category");
        if (!txt_gst_per) missingFields.push("txt_gst_per");
        if (!hsn_code) missingFields.push("hsn_code");

        if (missingFields.length > 0) {
            return res.status(400).json({ 
                status: false, 
                message: `Missing required fields: ${missingFields.join(", ")}` 
            });
        }

        const gstPercentage = parseFloat(txt_gst_per);
        if (isNaN(gstPercentage)) {
            return res.status(400).json({ status: false, message: "Invalid GST percentage format" });
        }

        const [gstResults] = await db.query(
            "SELECT product_gst_id FROM product_gst WHERE gst = ?",
            [gstPercentage]
        );

        if (!gstResults.length) {
            return res.status(400).json({ status: false, message: "Invalid GST percentage" });
        }

        const gst_prod_id = gstResults[0].product_gst_id;

        const insertQuery = `
            INSERT INTO service_category (company_name_id, service_category, gst_per, gst_prod_id, hsn_code)
            VALUES (?, ?, ?, ?, ?)`;

        const [result] = await db.query(insertQuery, [
            company_name_id,
            txt_product_category,
            gstPercentage,
            gst_prod_id,
            hsn_code,
        ]);

        const category_id = result.insertId;

        const insertQuery1 = `
            INSERT INTO company_category_gst_history (company_name_id, category_id, created_at, updated_at, gst)
            VALUES (?, ?, ?, ?, ?)`;

        await db.query(insertQuery1, [
            company_name_id,
            category_id,
            new Date().toISOString().split("T")[0],
            "9999-12-31",
            gstPercentage,
        ]);

        return res.status(201).json({ status: true, message: "Category added successfully" });

    } catch (error) {
        console.error("Error adding category:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};


const get_service_category_by_id = async (req, res) => {
  const id = req.params.id;

  try {
      const query = `
          SELECT service_category_id, service_category, hsn_code, image, gst_per, active_status
          FROM service_category
          WHERE service_category_id = ?`;

      const [category] = await db.query(query, [id]);

      if (category.length === 0) {
          return res.status(404).json({ status: false, message: "Category not found" });
      }

      res.status(200).json(
          category[0]
      );
  } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({
          status: false,
          message: "Internal Server Error",
      });
  }
};



const update= async (req,res)=>{
  const id = req.params.id; 
    const data=req.body
    console.log(data)

    try{
      const query="update service_category set service_category= ?,hsn_code= ?,gst_per= ?,active_status= ? where service_category_id=?"
      console.log(query)
      await db.query(query,[data.service_category,data.hsn_code,data.gst_per,data.active_status,id])
      res.json({status: true,message: "Updated Successfully"}).status(200)
    }catch(err){
      console.error(err);
      res.json({status: false,message: "Something went wrong"}).status(500)
    }
}
  

module.exports = { get_category_list_details, add_category,get_service_category_by_id,update };
