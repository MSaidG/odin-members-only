const bcrypt = require("bcryptjs");
const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const pool = require("../db/pool");

const router = express.Router();

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const { rows } = await pool.query("SELECT * FROM member WHERE username = $1", [
        username,
      ]);

      const member = rows[0];
      if (!member) {
        return done(null, false, { message: "No member found" });
      }

      const match = await bcrypt.compare(password, member.password);
      if (match) {
        return done(null, member);
      }

      return done(null, false);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((member, done) => {
  done(null, member.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM member WHERE id = $1", [
      id,
    ]);
    const member = rows[0];

    done(null, member);
  } catch (err) {
    done(err);
  }
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup/password", async (req, res, next) => {
  let { first_name, last_name, username, email, password } = req.body;
  bcrypt.hash(password, 10, async (err, hash) => {
    if (err) {
      console.log(err);
      return next(err);
    }
    password= hash;
    const client = await pool.connect();
    try {
      await client.query(
        "INSERT INTO member (first_name, last_name, username, email, password, status) VALUES ($1, $2, $3, $4, $5, $6)",
        [first_name, last_name, username, email, password, "basic"]
      );
      res.redirect("/");
    } catch (err) {
      return next(err);
    }
  });
});

router.post(
  "/login/password",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

router.get("/logout", (req, res) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
