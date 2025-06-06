const pool = require("../config/db");
const {
  createToken,
  hashedPassword,
  comparePassword,
} = require("../services/authServices");
const { sendOTPEmail } = require("../services/mailSender");
class Users {
  //register

  async register(req, res) {
    const { email, password, fcm, token, type, role, user_name, created_by } =
      req.body;
    const image = req.file;

    try {
      // ✅ 1. Check if user with the same email already exists
      const [existingUser] = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (existingUser.length > 0) {
        if (existingUser[0].is_delete === "true") {
          return res.status(400).json({
            error: true,
            msg: "Your account has been deleted. Please contact support.",
            data: {
              ...existingUser[0],
              followers: 0,
              followings: 0,
            },
          });
        }

        return res.status(400).json({
          error: true,
          msg: `This Already Exist! User ID: ${existingUser[0].id}, Email: ${email}`,
          data: existingUser[0],
        });
      }

      // ✅ 2. Hash password if EMAIL signup type
      let hashedPass = "";
      if (type === "EMAIL") {
        hashedPass = await hashedPassword(password);
      }

      const imagePath = image ? image.path : null;
      const createdByArray = [Number(created_by)];

      // ✅ 3. Insert new user into database
      const [result] = await pool.query(
        `INSERT INTO users
       (user_name, email, password, fcm, token, type, email_verified_status, status, role, is_delete, image, created_by)
       VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, 'false', ?, ?)`,
        [
          user_name,
          email,
          hashedPass,
          fcm,
          token,
          type,
          role,
          imagePath,
          JSON.stringify(createdByArray), // safe to store as string
        ]
      );

      // ✅ 4. Fetch newly inserted user
      const [newUser] = await pool.query("SELECT * FROM users WHERE id = ?", [
        result.insertId,
      ]);

      // ✅ 5. Generate JWT token
      const jwtToken = createToken({ email: newUser[0].email }, "1h");

      // ✅ 6. Respond with success
      res.status(201).json({
        error: false,
        msg: "User registered successfully",
        token: jwtToken,
        data: {
          ...newUser[0],
          followers: 0,
          followings: 0,
          rating: 0,
        },
      });
    } catch (error) {
      console.error("Error in register:", error);
      res.status(500).json({
        error: true,
        msg: "Internal server error",
        technicalIssue: error.message,
      });
    }
  }

  async login(req, res) {
    const { email, password, fcm, type, token } = req.body;

    try {
      const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);

      if (users.length === 0) {
        return res.status(400).json({ error: true, msg: "User not found" });
      }

      const existingUser = users[0];

      if (existingUser.is_delete === "true") {
        return res.status(400).json({
          error: true,
          msg: "Your account has been deleted. Please use a different email or contact support.",
        });
      }

      if (type === "EMAIL") {
        if (!password) {
          return res
            .status(400)
            .json({ error: true, msg: "Password is required" });
        }

        if (!existingUser.password) {
          return res
            .status(400)
            .json({ error: true, msg: "No password set for this user" });
        }

        const validPassword = await comparePassword(
          password,
          existingUser.password
        );
        if (!validPassword) {
          return res
            .status(400)
            .json({ error: true, msg: "Invalid credentials" });
        }
      }

      if (fcm) {
        await pool.query("UPDATE users SET fcm = ? WHERE id = ?", [
          fcm,
          existingUser.id,
        ]);
      }

      const jwtToken = createToken({ email: existingUser.email }, "120h");

      return res.status(200).json({
        error: false,
        msg: "Login successful",
        token: jwtToken,
        data: {
          ...existingUser,
        },
      });
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({
        error: true,
        msg: "Internal server error",
        technicalIssue: error.message,
      });
    }
  }

  // Get an order by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const query = "SELECT * FROM users WHERE id = ?";
      const [rows] = await pool.query(query, [id]);

      if (rows.length === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      return res.status(200).json({ data: rows[0] });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  async testGet(req, res) {
    try {
      const [rows] = await pool.query("SELECT * FROM users");
      return res
        .status(200)
        .json({ message: "Hello from the backend!", data: rows });
    } catch (error) {
      console.error("Database query error:", error);
      return res
        .status(500)
        .json({ error: "Internal Server Error", errors: error });
    }
  }

  async testAdd(req, res) {
    try {
      const { email, user_name } = req.body;

      if (!email || !user_name) {
        return res
          .status(400)
          .json({ error: "Email and user_name are required" });
      }

      const query = "INSERT INTO users (email, user_name) VALUES (?, ?)";
      const [result] = await pool.query(query, [email, user_name]);

      return res.status(201).json({
        message: "User inserted successfully",
        userId: result.insertId,
      });
    } catch (error) {
      console.error("Database insert error:", error);
      return res
        .status(500)
        .json({ error: "Internal Server Error", details: error });
    }
  }

  async editUser(req, res) {
    const { id } = req.params;
    const updates = req.body;
    const image = req.file;

    try {
      const [userRows] = await pool.query("SELECT * FROM users WHERE id = ?", [
        id,
      ]);
      if (userRows.length === 0) {
        return res.status(404).json({ error: true, msg: "User not found" });
      }

      const fields = [];
      const values = [];

      const updatableFields = [
        "full_name",
        "user_name",
        "country",
        "city",
        "phone_no",
        "location_address",
        "location_log",
        "location_lat",
        "email",
        "stripe_subscription_status",
        "email_verified_status",
        "fcm",
        "status",
        "role",
        "live_image",
        "cnic",
        "subscription",
        "phone_no_verified_status",
        "email_code",
        "created_at",
        "verify_status",
        "bitcoin",
        "paypal",
        "bank",
        "type",
        "created_by",
        "reset_password_otp",
        "password",
        "token",
        "is_delete",
      ];

      for (const field of updatableFields) {
        if (updates[field] !== undefined) {
          fields.push(`\`${field}\` = ?`);
          values.push(updates[field]);
        }
      }

      if (image) {
        fields.push("`image` = ?");
        values.push(image.path);
      }

      if (fields.length === 0) {
        return res
          .status(400)
          .json({ error: true, msg: "No fields provided for update" });
      }

      values.push(id); // ID for WHERE clause

      const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
      await pool.query(sql, values);

      const [updatedUser] = await pool.query(
        "SELECT * FROM users WHERE id = ?",
        [id]
      );

      return res.status(200).json({
        error: false,
        msg: "User updated successfully",
        data: updatedUser[0],
      });
    } catch (error) {
      console.error("Error in editUser:", error);
      return res.status(500).json({
        error: true,
        msg: "Internal server error",
        technicalIssue: error.message,
      });
    }
  }

  async getCustomers(req, res) {
    const { id } = req.params;
    const search = req.query.search || "";
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    try {
      const numericId = Number(id);
      const searchValue = `%${search}%`;
      const jsonId = JSON.stringify([numericId]); // e.g., "[123]"

      // --- Count Query ---
      const countQuery = `
      SELECT COUNT(DISTINCT u.id) AS total
      FROM users u
      WHERE JSON_CONTAINS(u.created_by, ?, '$')
        AND (
          u.user_name LIKE ? OR
          CAST(u.id AS CHAR) LIKE ?
        )
    `;
      const [countResult] = await pool.query(countQuery, [
        jsonId,
        searchValue,
        searchValue,
      ]);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // --- Paginated Query with Aggregated Measurements ---
      const dataQuery = `
      SELECT 
        u.*,
        IFNULL((
          SELECT JSON_ARRAYAGG(m.id)
          FROM measurements m
          WHERE m.user_id = u.id
        ), '[]') AS measurement_ids
      FROM users u
      WHERE JSON_CONTAINS(u.created_by, ?, '$')
        AND (
          u.user_name LIKE ? OR
          CAST(u.id AS CHAR) LIKE ?
        )
      ORDER BY u.id DESC
      LIMIT ? OFFSET ?
    `;
      const [rows] = await pool.query(dataQuery, [
        jsonId,
        searchValue,
        searchValue,
        limit,
        offset,
      ]);

      if (rows.length === 0) {
        return res.status(404).json({ error: true, msg: "No customers found" });
      }

      const parsedRows = rows.map((row) => ({
        ...row,
        measurement_ids: JSON.parse(row.measurement_ids),
      }));

      return res.status(200).json({
        error: false,
        msg: "Customers retrieved successfully",
        data: parsedRows,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      });
    } catch (error) {
      console.error("Error in getCustomers:", error);
      return res.status(500).json({
        error: true,
        msg: "Internal server error",
        technicalIssue: error.message,
      });
    }
  }

  async changePassword(req, res) {
    const { id } = req.params; // Assuming you're passing user ID as param
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: true, msg: "Old and new passwords are required" });
    }

    try {
      const [userRows] = await pool.query("SELECT * FROM users WHERE id = ?", [
        id,
      ]);

      if (userRows.length === 0) {
        return res.status(404).json({ error: true, msg: "User not found" });
      }

      const user = userRows[0];

      if (!user.password) {
        return res
          .status(400)
          .json({ error: true, msg: "No password set for this user" });
      }

      const isMatch = await comparePassword(oldPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ error: true, msg: "Old password is incorrect" });
      }

      const hashedNewPassword = await hashedPassword(newPassword);

      await pool.query("UPDATE users SET password = ? WHERE id = ?", [
        hashedNewPassword,
        id,
      ]);

      return res
        .status(200)
        .json({ error: false, msg: "Password changed successfully" });
    } catch (error) {
      console.error("Error in changePassword:", error);
      return res.status(500).json({
        error: true,
        msg: "Internal server error",
        technicalIssue: error.message,
      });
    }
  }

  async forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: true, msg: "Email is required" });
    }

    try {
      const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
      if (users.length === 0) {
        return res.status(404).json({ error: true, msg: "User not found" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Save OTP in DB
      await pool.query(
        "UPDATE users SET reset_password_otp = ? WHERE email = ?",
        [otp, email]
      );

      // Send OTP email
      await sendOTPEmail(email, otp);

      return res.status(200).json({ error: false, msg: "OTP sent to email" });
    } catch (error) {
      console.error("Error in forgotPassword:", error);
      return res.status(500).json({
        error: true,
        msg: "Internal server error",
        technicalIssue: error.message,
      });
    }
  }
  async verifyOtp(req, res) {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ error: true, msg: "Email and OTP are required" });
    }

    try {
      const [users] = await pool.query(
        "SELECT * FROM users WHERE email = ? AND reset_password_otp = ?",
        [email, otp]
      );

      if (users.length === 0) {
        return res
          .status(400)
          .json({ error: true, msg: "Invalid OTP or email" });
      }

      return res
        .status(200)
        .json({ error: false, msg: "OTP verified successfully" });
    } catch (error) {
      console.error("Error in verifyOtp:", error);
      return res.status(500).json({
        error: true,
        msg: "Internal server error",
        technicalIssue: error.message,
      });
    }
  }

  async resetPassword(req, res) {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ error: true, msg: "All fields are required" });
    }

    try {
      const [users] = await pool.query(
        "SELECT * FROM users WHERE email = ? AND reset_password_otp = ?",
        [email, otp]
      );

      if (users.length === 0) {
        return res
          .status(400)
          .json({ error: true, msg: "Invalid OTP or email" });
      }

      const hashedNewPassword = await hashedPassword(newPassword);

      await pool.query(
        "UPDATE users SET password = ?, reset_password_otp = NULL WHERE email = ?",
        [hashedNewPassword, email]
      );

      return res
        .status(200)
        .json({ error: false, msg: "Password reset successfully" });
    } catch (error) {
      console.error("Error in resetPassword:", error);
      return res.status(500).json({
        error: true,
        msg: "Internal server error",
        technicalIssue: error.message,
      });
    }
  }

  async updateCreatedBy(req, res) {
    const { userId } = req.params;
    const { action = "add", createdId } = req.body;

    if (
      !userId ||
      createdId === undefined ||
      !["add", "remove"].includes(action)
    ) {
      return res.status(400).json({
        message:
          "userId and createdId are required. Action must be 'add' or 'remove'",
      });
    }

    try {
      const numericId = parseInt(createdId, 10);
      if (isNaN(numericId)) {
        return res
          .status(400)
          .json({ message: "createdId must be a valid number" });
      }

      if (action === "add") {
        await pool.execute(
          `
        UPDATE users
        SET created_by = JSON_ARRAY_APPEND(
          IFNULL(created_by, JSON_ARRAY()), '$', CAST(? AS UNSIGNED)
        )
        WHERE id = ?
        `,
          [numericId, userId]
        );

        return res
          .status(200)
          .json({ message: "created_by updated (added) successfully" });
      }

      if (action === "remove") {
        const [userRows] = await pool.query(
          `SELECT created_by FROM users WHERE id = ?`,
          [userId]
        );

        if (!userRows.length) {
          return res.status(404).json({ message: "User not found" });
        }

        let currentArray;
        try {
          const raw = userRows[0].created_by;
          currentArray = Array.isArray(raw) ? raw : JSON.parse(raw || "[]");

          if (!Array.isArray(currentArray)) currentArray = [];
        } catch {
          currentArray = [];
        }

        const updatedArray = currentArray.filter((id) => id !== numericId);

        await pool.execute(`UPDATE users SET created_by = ? WHERE id = ?`, [
          JSON.stringify(updatedArray),
          userId,
        ]);

        return res
          .status(200)
          .json({ message: "created_by updated (removed) successfully" });
      }
    } catch (err) {
      console.error("MySQL Error:", err);
      return res
        .status(500)
        .json({ message: "Server error", error: err.message });
    }
  }
}

module.exports = new Users();
