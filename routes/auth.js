const bcrypt = require("bcryptjs");
const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const pool = require("../db/pool");
const { body, check, validationResult, ExpressValidator } = require("express-validator");

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

const alphaErr = "Must only contain alphabetical characters";
const lengthErr = "Must be between 2 and 20 characters";
const emailErr = "Must be a valid email address";
const validateUser = [

  body("first_name", "First Name").trim().escape()
    .isAlpha().withMessage("First Name " + alphaErr)
    .isLength({min: 2, max: 40}).withMessage("First Name " + lengthErr),
  
  body("last_name", "Last Name").trim().escape()
    .isAlpha().withMessage("Last Name" + alphaErr)
    .isLength({min: 2, max: 40}).withMessage("Last Name" + lengthErr),

  body("email", "Email").trim()
    .isEmail().withMessage(emailErr)
    .custom( async (value) => {
      const user = await pool.query("SELECT * FROM member WHERE email = $1", [
        value
      ])
      if (user.id) {
        throw new Error("Email already in use");
      }
    }),

  body("username", "Username").trim().escape()
    .custom( async (value) => {
      const user = await pool.query("SELECT * FROM member WHERE username = $1", [
        value
      ])
      if (user.id) {
        throw new Error("Username already in use");
      }
    }),

  body("password", "Password")
    .isLength({ min: 5 }).withMessage('Password must be at least 5 chars long')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[a-z]/).withMessage('Password must contain a lower case letter')
    .matches(/[A-Z]/).withMessage('Password must contain an upper case letter')
    .matches(/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/).withMessage('Password must contain a special character'),

  body('confirm-password', 'Confirm Password').custom((value, { req }) => {
    return value === req.body.password;
  })


  // body("confirm-password", "Confirm Password").custom((value, { req }) => {
  //   if (value !== req.body.password) {
  //     throw new Error("Passwords do not match");
  //   }
  // })

]

const signupPost = [
  validateUser,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

      res.render("signup", { 
        errors: errors.array(),
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        username: req.body.username,
        email: req.body.email
      });

    } else {

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

    }

  }
]

router.post("/signup/password", signupPost);

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
