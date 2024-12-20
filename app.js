const express = require("express");
const session = require("express-session");
const app = express();
const authRouter = require("./routes/auth");
const indexRouter = require("./routes/index");
const passport = require("passport");
const PgStore = require("connect-pg-simple")(session);
const pool = require("./db/pool");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", "views");

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new PgStore({
      pool: pool,
      createTableIfMissing: true,
    }),
  })
);
app.use(passport.authenticate("session"));

app.use("/", indexRouter);
app.use("/", authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
