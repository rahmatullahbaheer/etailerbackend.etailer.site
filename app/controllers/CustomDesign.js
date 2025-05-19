const pool = require("../config/db");

class CustomDesignController {
  async createCustomDesign(req, res) {
    const image = req.file;

    try {
      if (!image) {
        return res.status(400).json({ message: "Image is required" });
      }

      const { user_id, name, urdu_name } = req.body;
      const imagePath = image ? image.path : null; // ðŸ‘ˆ Save image path
      const designData = {
        user_id,
        name,
        urdu_name,
        image: imagePath,
        created_at: new Date(), // Add current date & time
      };

      const query = "INSERT INTO custom_design SET ?";
      const [rows] = await pool.query(query, [designData]);
      console.log("MMMMM", rows);
      //find record
      const [record] = await pool.query(
        "SELECT * FROM custom_design WHERE id = ?",
        [rows.insertId]
      );

      return res.status(201).json({
        message: "Custom design added successfully",
        data: {
          id: record[0].id,
          src: record[0].image,
          title: record[0].name,
          urdu: record[0].urdu_name,
          type: record[0].type,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get all custom designs
  async getCustomDesigns(req, res) {
    try {
      const [rows] = await pool.query("SELECT * FROM custom_design");
      return res.json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get a custom design by ID
  async getCustomDesignById(req, res) {
    const { id } = req.params;
    try {
      const [rows] = await pool.query(
        "SELECT * FROM custom_design WHERE id = ?",
        [id]
      );
      if (rows.length === 0)
        return res.status(404).json({ message: "Custom design not found" });
      return res.json(rows[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get custom designs by user ID
  async getCustomDesignsByUserId(req, res) {
    const { user_id } = req.params;
    try {
      const [rows] = await pool.query(
        "SELECT * FROM custom_design WHERE user_id = ?",
        [user_id]
      );
      if (rows.length === 0)
        return res
          .status(404)
          .json({ message: "No designs found for this user" });
      return res.json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Update a custom design
  async updateCustomDesign(req, res) {
    const { id } = req.params;
    const updates = req.body;
    try {
      const query = "UPDATE custom_design SET ? WHERE id = ?";
      await pool.query(query, [updates, id]);
      return res.json({ message: "Custom design updated successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Delete a custom design
  async deleteCustomDesign(req, res) {
    const { id } = req.params;
    try {
      await pool.query("DELETE FROM custom_design WHERE id = ?", [id]);
      return res.json({ message: "Custom design deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new CustomDesignController();
