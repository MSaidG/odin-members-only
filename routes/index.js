const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const pool = require("../db/pool");


router.get("/", async (req, res) => {
  let messages = await pool.query("SELECT title, text FROM message");
  if (req.user) {
    if (req.user.status === "admin" || req.user.status === "club_member") {
      messages = await pool.query("SELECT message.id, message.title, message.text, message.time, member.username AS author FROM message JOIN member ON message.author_id = member.id");  
    }
  }
  res.render("index", {
    messages: messages.rows,
    user: req.user,
  });
});

router.get("/new-message", (req, res) => {
  res.render("new-message", {
    user: req.user,
  });
});

router.post("/new-message", async (req, res) => {
  const { title, text } = req.body;
  const id = req.user.id;
  await pool.query(
    "INSERT INTO message (title, text, author_id) VALUES ($1, $2, $3)",
    [title, text, id]
  );
  res.redirect("/");
});

router.get("/club", (req, res) => {
  res.render("club", {
    user: req.user,
  });
});

router.post("/club/password", async (req, res) => {
  const { password } = req.body;
  try {

    const adminPass = await pool.query("SELECT * FROM member WHERE username = $1", [
      "admin",
    ]);
    const admin = adminPass.rows[0];
    const matchAdmin = await bcrypt.compare(password, admin.password);

    const club_member_pass = await pool.query("SELECT * FROM member WHERE username = $1", [
      "club_member",
    ])
    const club_member = club_member_pass.rows[0];
    const matchClubMember = await bcrypt.compare(password, club_member.password);

    if (matchAdmin) {
      await pool.query("UPDATE member SET status = 'admin' WHERE id = $1", [
        req.user.id,
      ]);
    }
    else if (matchClubMember) { 
      await pool.query("UPDATE member SET status = 'club_member' WHERE id = $1", [
        req.user.id,
      ]);
    }
    else {
      await pool.query("UPDATE member SET status = 'basic(restricted)' WHERE id = $1", [
        req.user.id,
      ]);
    }

    res.redirect("/");

  } catch (err) {
    console.log(err);
  }
});

router.delete("/delete-message", async (req, res) => {
  const { id } = req.body;
  await pool.query("DELETE FROM message WHERE id = $1", [id]);
  res.redirect("/");
});

module.exports = router;
