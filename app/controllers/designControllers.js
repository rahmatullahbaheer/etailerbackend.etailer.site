const pool = require("../config/db");
// const { body, validationResult } = require("express-validator");

class designControllers {
  // Create a new design entry
  async createDesign(req, res) {
    try {
      const query = "INSERT INTO styles_design SET ?";
      await pool.query(query, [req.body]);
      return res
        .status(201)
        .json({ message: "Design added successfully", data: req.body });
    } catch (error) {
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
  //   //getDesignsByUserId
  async getDesignsByUserId(req, res) {
    const { user_id } = req.params;
    try {
      const [rows] = await pool.query(
        "SELECT * FROM styles_design WHERE user_id = ?",
        [user_id]
      );
      if (rows.length === 0)
        return res.status(404).json({ message: "Design not found" });
      return res.json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  //   // Update a design
  async updateDesign(req, res) {
    const { id } = req.params;
    const updates = req.body;

    try {
      const query = "UPDATE styles_design SET ? WHERE id = ?";
      await pool.query(query, [updates, id]);
      return res.json({ message: "Design updated successfully" });
    } catch (error) {
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
