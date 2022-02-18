const express = require("express");
const router = express.Router();

const axios = require("axios");

const r = require("../bin/database");

// films, get fils
router.get("/list", function (req, res, next) {
  const filter = {};

  if (req.query.seen && req.query.seen === true) {
    filter.watched = false;
  }

  // Get films
  r.table("films")
    .filter(filter)
    .then(async (result) => {
      const results = [];

      for (let i = 0; i < result.length; i++) {
        const film = result[i];

        const querys = [
          `https://api.themoviedb.org/3/movie/${film.dbId}?api_key=${process.env.TMDB_KEY}`,
          `https://api.themoviedb.org/3/movie/${film.dbId}/watch/providers?api_key=${process.env.TMDB_KEY}`,
        ];
        let resObj = {};
        await Promise.all(
          querys.map(async (query) => {
            let response = await axios.get(query, {}).then((r) => r.data);

            if (response.results) {
              response = response.results.GB;
            }

            resObj = { ...response, ...resObj };
          })
        );
        results.push({ ...resObj, ...film });
      }

      return res.json({ message: "success", films: results });
    })
    .catch((error) => {
      console.log(error);
    });
});

// films, seen film
router.post("/seen", (req, res) => {
  if (!req.body) return res.json({ message: "failed", reason: "body missing" });

  r.table("films")
    .get(req.body.id)
    .update({ watched: req.body.watched })
    .then((result) => {
      res.json({ message: "success" });
    })
    .catch((error) => {
      return res.json({
        message: "failed",
        reason: "an error occured when writing to the database.",
      });
    });
});

// films, seen

// films, edit

// files, add
router.post("/add", (req, res) => {
  const newFilm = {
    watched: false,
  };

  if (!req.body) {
    return res.json({ message: "failed", reason: "body is missing" });
  }

  if (req.body.movieDb) {
    newFilm.movieDb = req.body.movieDb;
    newFilm.dbId = req.body.dbId;
  } else {
    newFilm.movieDb = false;
    newFilm.dbId = null;
    newFilm.title = req.body.title;
  }

  r.table("films")
    .insert(newFilm)
    .then((result) => {
      return res.json({ message: "success" });
    })
    .catch((error) => {
      return res.json({
        message: "failed",
        reason: "an error occured when writing to the database.",
      });
    });
});

// files, dynamic add
router.get("/search", function (req, res) {
  validateFields(req.query, "film", res);

  axios
    .get(
      `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_KEY}&query=${req.query.film}`,
      {}
    )
    .then((result) => {
      return { films: result.data, ...result.status };
    })
    .then((result) => {
      console.log(result);
      res.json({
        message: "success",
        query: req.query.filmName,
        matches: result.films.results.slice(0, 5),
      });
    });
});

module.exports = router;

function validateFields(body, name, res) {
  if (!body.hasOwnProperty(name)) {
    return res.json({ message: "failed", reason: "missing field " + name });
  }

  if (!body[`${name}`].length > 0) {
    return res.json({ message: "failed", reason: "missing field " + name });
  }
}
