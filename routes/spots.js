const express = require("express");
const passport = require("passport");
const router = express.Router();
const knex = require("../db");
const isAdmin = require("../middleware/isAdmin");
const errorHandler = require("../errors/handler");
const { getUser } = require("../utils/user");
const { isAvailable: spotIsAvailable } = require("../utils/spot");

router.get("/", async (req, res) => {
  const spots = await knex("spots").where({ ...req.body });

  res.send({
    spots,
  });
});

// Selectionner tout les spots qui n'ont pas d'id referencé dans la table users.spot_id

router.get("/available", async (req, res) => {
  const { floor } = req.query;
  const where = {};

  if (floor) {
    where.floor = floor.toString();
  }

  const spots = await knex
    .select("spots.*")
    .from("spots")
    .leftJoin("users", "spots.id", "users.spot_id")
    .where({ "users.id": null, ...where });

  res.send({
    spots,
  });
});

router.get("/me", passport.authenticate("jwt"), async (req, res) => {
  const user = await getUser(req);

  let spot = {};

  if (user.spot_id) {
    spots = await knex("spots").where({ id: user.spot_id });
    spot = spots[0] || {};
  }

  res.send({
    spot,
  });
});

router.post("/", passport.authenticate("jwt"), isAdmin, async (req, res) => {
  const { number, floor, occupancyTime } = req.body;

  try {
    const spots = await knex("spots")
      .insert({
        number,
        floor,
        occupancyTime,
      })
      .returning("*");

    const spot = spots[0];

    res.send({
      spot,
    });
  } catch (err) {
    errorHandler(err, res);
  }
});

router.put("/:id", passport.authenticate("jwt"), isAdmin, async (req, res) => {
  const { id } = req.params;
  const { number, floor, occupancyTime } = req.body;

  try {
    await knex("spots")
      .where({ id })
      .update({
        number,
        floor,
        occupancyTime,
      })
      .returning("*");

    res.sendStatus(200);
  } catch (err) {
    errorHandler(err, res);
  }
});

router.delete(
  "/:id",
  passport.authenticate("jwt"),
  isAdmin,
  async (req, res) => {
    const { id } = req.params;

    try {
      await knex("spots").where({ id }).del();

      res.sendStatus(200);
    } catch (err) {
      errorHandler(err, res);
    }
  }
);
router.post(
  "/:id/reservation",
  passport.authenticate("jwt"),
  isAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { reservation, userId } = req.body;

    if (reservation !== "true" && reservation !== "false") {
      errorHandler({ message: "No reservation value." }, res);

      return;
    }

    const isAvailable = await spotIsAvailable(id);

    if (!isAvailable) {
      errorHandler({ message: "Spot is not available." }, res);

      return;
    }

    try {
      let spotId;

      if (reservation === "true") {
        spotId = id;
      } else {
        spotId = null;
      }

      await knex("users").where({ id: userId }).update({
        spot_id: spotId,
      });

      res.sendStatus(200);
    } catch (err) {
      errorHandler(err, res);
    }
  }
);

module.exports = router;
