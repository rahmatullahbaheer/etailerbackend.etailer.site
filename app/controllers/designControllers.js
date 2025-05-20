const pool = require("../config/db");
// const { body, validationResult } = require("express-validator");

class designControllers {
  // Create a new design entry
  async createDesign(req, res) {
    try {
      const { user_id, styles_ids, description } = req.body;

      // Validate required fields
      if (!user_id || !Array.isArray(styles_ids)) {
        return res
          .status(400)
          .json({ error: "user_id and styles_ids are required" });
      }

      const payload = {
        user_id,
        styles_ids: JSON.stringify(styles_ids), // Store as JSON string in DB
        description: description || "",
      };

      const query = "INSERT INTO styles_design SET ?";
      const newData = await pool.query(query, [payload]);

      //get new data
      const [rows] = await pool.query(
        "SELECT * FROM styles_design WHERE id = ?",
        [
          // id
          // user_id,
          // styles_ids,
          // description,
          newData.insertId,
        ]
      );

      return res.status(201).json({
        message: "Design added successfully",
        data: rows[0],
      });
    } catch (error) {
      console.error("Error in createDesign:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  //   // Get all designs
  async getDesigns(req, res) {
    try {
      const [rows] = await pool.query("SELECT * FROM styles_design");
      return res.json(rows);
      //   return res.send("Hello World>OOOOOO");
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  //   // Get a single design by ID
  async getDesignById(req, res) {
    const { id } = req.params;
    try {
      const [rows] = await pool.query(
        "SELECT * FROM styles_design WHERE id = ?",
        [id]
      );
      if (rows.length === 0)
        return res.status(404).json({ message: "Design not found" });
      return res.json(rows[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  // Get designs by user ID in descending order
  async getDesignsByUserId(req, res) {
    const { user_id } = req.params;
    try {
      const [rows] = await pool.query(
        "SELECT * FROM styles_design WHERE user_id = ? ORDER BY id DESC",
        [user_id]
      );
      if (rows.length === 0)
        return res.status(404).json({ message: "Design not found" });
      return res.json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Update a design
  async updateDesign(req, res) {
    const { id } = req.params;
    const updates = { ...req.body };

    try {
      // Convert styles_ids array to JSON string if present
      if (Array.isArray(updates.styles_ids)) {
        updates.styles_ids = JSON.stringify(updates.styles_ids);
      }

      const query = "UPDATE styles_design SET ? WHERE id = ?";
      await pool.query(query, [updates, id]);

      //get record

      const [rows] = await pool.query(
        "SELECT * FROM styles_design WHERE id = ?",
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: "Design not found" });
      }

      return res.status(200).json({
        message: "Design updated successfully",
        data: rows[0],
      });
    } catch (error) {
      console.error("Error updating design:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  //   // Delete a design
  async deleteDesign(req, res) {
    const { id } = req.params;
    try {
      await pool.query("DELETE FROM styles_design WHERE id = ?", [id]);
      return res.json({ message: "Design deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new designControllers();
