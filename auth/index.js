require("dotenv").config();
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const JWTstrategy = require("passport-jwt").Strategy;
const bcrypt = require("bcrypt");

const knex = require("../db");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const users = await knex("users").where({ id });

  const user = users[0];

  done(null, {
    id: user.id,
    name: user.name,
    role: user.role,
  });
});

passport.use(
  "sign-up",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const hash = await bcrypt.hash(password, 10);
        const users = await knex("users")
          .insert({
            email,
            password: hash,
            name: req.body.name,
          })
          .returning("*");

        const user = users[0];

        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  "sign-in",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const users = await knex("users").where({ email }).returning("*");

        const user = users[0];

        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        const validate = await bcrypt.compare(password, user.password);

        if (!validate) {
          return done(null, false, { message: "Wrong Password" });
        }

        return done(null, user, { message: "Logged in Successfully" });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new JWTstrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: (req) =>
        req && req.cookies && req.cookies["park_manager_token"],
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);
