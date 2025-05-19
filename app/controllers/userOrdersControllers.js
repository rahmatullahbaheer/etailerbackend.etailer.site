const pool = require("../config/db");

class userOrdersControllers {
  // Create a new order
  // Create a new order
  async createOrders(req, res) {
    const image = req.file;
    const suitImage = image ? image.path.replace(/\\/g, "/") : null;

    try {
      const deliveryDate = req.body.suitDeliveryDate
        ? new Date(req.body.suitDeliveryDate)
            .toISOString()
            .slice(0, 19)
            .replace("T", " ")
        : null;

      const orderData = {
        suitDeliveryDate: deliveryDate,
        suitCount: req.body.suitCount,
        amountPerSuit: req.body.amountPerSuit,
        advancePayment: req.body.advancePayment,
        urgent: req.body.urgent,
        created_at: new Date(),
        user_id: req.body.user_id,
        status: req.body.status,
        suitImage: suitImage,
        mearsurement_id: req.body.mearsurement_id,
        style_id: req.body.style_id,
      };

      const query = "INSERT INTO user_orders SET ?";
      const [result] = await pool.query(query, [orderData]);

      const insertedId = result.insertId;

      return res.status(201).json({
        message: "Order added successfully",
        data: { ...orderData, id: insertedId },
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get an order by ID
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const query = "SELECT * FROM user_orders WHERE id = ?";
      const [rows] = await pool.query(query, [id]);

      if (rows.length === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      return res.status(200).json({ data: rows[0] });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Update an order
  async updateOrder(req, res) {
    try {
      const { id } = req.params;
      const image = req.file;
      const suitImage = image ? image.path : req.body.suitImage;

      // Fix date format for MySQL
      const deliveryDate = req.body.suitDeliveryDate
        ? new Date(req.body.suitDeliveryDate)
            .toISOString()
            .slice(0, 19)
            .replace("T", " ")
        : null;

      const updatedOrder = {
        suitDeliveryDate: deliveryDate,
        suitCount: req.body.suitCount,
        amountPerSuit: req.body.amountPerSuit,
        advancePayment: req.body.advancePayment,
        urgent: req.body.urgent,
        status: req.body.status,
        suitImage: suitImage,
      };

      const query = "UPDATE user_orders SET ? WHERE id = ?";
      const [result] = await pool.query(query, [updatedOrder, id]);

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Order not found or no changes made" });
      }

      return res.status(200).json({ message: "Order updated successfully" });
    } catch (error) {
      console.log("Error", error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Update an order to set is_delete = false
  async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      const query = 'UPDATE user_orders SET is_delete = "false" WHERE id = ?';
      const [result] = await pool.query(query, [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      return res.status(200).json({ message: "Order updated successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getOrdersByStatus(req, res) {
    try {
      const { status } = req.query; // Get the status from the request query
      const query = `
      SELECT uo.id, uo.suitDeliveryDate,uo.suitImage, uo.suitCount, uo.amountPerSuit, uo.advancePayment, uo.urgent, 
             uo.created_at, uo.user_id, uo.status as order_status, 
             u.id as user_id, u.full_name, u.image, u.user_name, u.country, u.city, u.phone_no, 
             u.location_address, u.location_log, u.location_lat, u.email, 
             u.stripe_subscription_status, u.email_verified_status, u.fcm, u.status as user_status, 
             u.role, u.live_image, u.cnic, u.subscription, u.phone_no_verified_status, 
             u.email_code, u.created_at as user_created_at, u.verify_status, u.bitcoin, 
             u.paypal, u.bank, u.type, u.created_by, u.reset_password_otp, u.password, 
             u.token, u.is_delete, 
             i.image_url as user_image_url
      FROM user_orders uo
      JOIN users u ON uo.user_id = u.id
      LEFT JOIN images i ON u.id = i.user_id
      WHERE uo.status = ? AND uo.is_delete = "true"  -- <<< ADD THIS CONDITION
    `;

      const [rows] = await pool.query(query, [status]);

      const response = rows.map((order) => ({
        orderDetails: {
          id: order.id,
          suitDeliveryDate: order.suitDeliveryDate,
          suitCount: order.suitCount,
          amountPerSuit: order.amountPerSuit,
          advancePayment: order.advancePayment,
          urgent: order.urgent,
          created_at: order.created_at,
          user_id: order.user_id,
          status: order.order_status,
        },
        userDetails: {
          id: order.user_id,
          user_name: order.user_name,
          user_image_url: order.suitImage, // Use the correct image URL
        },
      }));

      return res.status(200).json({ data: response });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new userOrdersControllers();
