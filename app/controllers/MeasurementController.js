const pool = require("../config/db");
class MeasurementController {
     // Get all measurements
  // Get all measurements
  async getAll(req, res) {
    try {
      const [rows] = await pool.query("SELECT * FROM measurements");
      res.json({
        error: false,
        message: "Measurements retrieved",
        ...(rows. length&& { data: rows }),
      });
    } catch (error) {
      res.status(500).json({ error: true, message: error.message });
    }
  }

  // Get measurement(s) by ID or user_id
async getById(req, res) {
  const { id, user_id } = req.query;

  try {
    let query = "";
    let params = [];

    if (id) {
      query = "SELECT * FROM measurements WHERE id = ?";
      params = [id];
    } else if (user_id) {
      query = "SELECT * FROM measurements WHERE user_id = ?";
      params = [user_id];
    } else {
      return res.status(400).json({
        error: true,
        message: "Missing id or user_id in request",
      });
    }

    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: "Measurement not found",
      });
    }

    res.json({
      error: false,
      message: "Measurement retrieved111",
      data: id ? rows[0] : rows[0], // If using id, return single object; else return array
    });

  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
}


  // Create new measurement
  async create(req, res) {
    // const { error } = measurementSchema.validate(req.body);
    // if (error)
    //   return res
    //     .status(400)
    //     .json({ error: true, message: error.details[0].message });

    try {
      const {
        user_id,
        kameez,
        sleveeLight,
        shoulder,
        collar,
        chest,
        slevee_open,
        sleeveOpeningTop,
        kameez_bottom_hem,
        waist,
        shalwar_length,
        leg_open,
      } = req.body;

      const [result] = await pool.query(
        "INSERT INTO measurements (user_id, kameez, sleveeLight,shoulder,sleeveOpeningTop, collar, chest, slevee_open, kameez_bottom_hem, waist, shalwar_length, leg_open) VALUES (?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?,?)",
        [
          user_id,
          kameez,
          sleveeLight,
          shoulder,
          collar,
          chest,
          slevee_open,
          sleeveOpeningTop,
          kameez_bottom_hem,
          waist,
          shalwar_length,
          leg_open,
        ]
      );

      res.status(201).json({
        error: false,
        message: "Measurement created successfully",
        data: { measurement_id: result.insertId },
      });
    } catch (error) {
      res.status(500).json({ error: true, message: error.message });
      console.log(error);
    }
  }

  // Update measurement
  async update(req, res) {
    const { id } = req.params;
    // const { error } = measurementSchema.validate(req.body);
    // if (error)
    //   return res
    //     .status(400)
    //     .json({ error: true, message: error.details[0].message });

    try {
      const [result] = await pool.query(
        "UPDATE measurements SET ? WHERE id = ?",
        [req.body, id]
      );

      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ error: true, message: "Measurement not found" });

      res.json({
        error: false,
        message: "Measurement updated successfully",
      });
    } catch (error) {
      res.status(500).json({ error: true, message: error.message });
    }
  }

  // Delete measurement
  async delete(req, res) {
    const { id } = req.params;
    try {
      const [result] = await pool.query(
        "DELETE FROM measurements WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ error: true, message: "Measurement not found" });

      res.json({
        error: false,
        message: "Measurement deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ error: true, message: error.message });
    }
  }
}
module.exports = new MeasurementController();