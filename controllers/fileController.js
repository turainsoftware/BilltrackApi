const path = require("path");
const fs = require("fs");

const serveImage = (req, res) => {
  try {
    const imageName = req.params.name;

    const filePath = path.join(
      "D:",
      "billing_software_backend_api",
      "media",
      "company_logo",
      imageName
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: false,
        message: "Image not found",
      });
    }

    // Serve the image
    res.sendFile(filePath);
  } catch (error) {
    console.error("Error serving image:", error.message);
    res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

module.exports = { serveImage };
