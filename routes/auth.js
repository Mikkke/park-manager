require("dotenv").config();
const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const knex = require("../db");

router.post(
  "/sign-up",
  passport.authenticate("sign-up"),
  async (req, res, next) => {
    const { user } = req;

    res.json({
      message: "Signup successful",
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });
  }
);

router.post("/sign-in", (req, res, next) => {
  passport.authenticate("sign-in", (err, user, info) => {
    try {
      if (err || !user) {
        const error = new Error("An error occurred.");

        return next(error);
      }

      req.login(user, (error) => {
        if (error) return next(error);

        const body = { id: user.id, email: user.email };
        const token = jwt.sign({ user: body }, process.env.JWT_SECRET);

        res.cookie("park_manager_token", token);

        return res.send({
          user: {
            id: user.id,
            name: user.name,
            role: user.role,
          },
        });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

router.get("/sign-out", async (req, res) => {
  req.logout();
  req.session.destroy();

  res
    .clearCookie("connect.sid", {
      path: "/",
    })
    .clearCookie("park_manager_token", {
      path: "/",
    })
    .sendStatus(200);
});

module.exports = router;
