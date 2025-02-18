#!/usr/bin/env node

const { Command } = require("commander");
const ora = require("ora");
const dotenv = require("dotenv");
dotenv.config();

const {
  getPersons,
  getPerson,
  getMovies,
  getMovie,
} = require("./utils/httpsRequest");
const {
  renderPersons,
  renderPerson,
  renderMovies,
  renderMovie,
} = require("./utils/renderRequest");

const requestOptions = {
  href: "https://api.themoviedb.org",
  protocol: "https:",
  hostname: "api.themoviedb.org",
  path: ``,
  port: 443,
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.API_KEY}`,
  },
};

const program = new Command();
program.version("0.0.1");

/*
************ test it with **************

node src/moviedb.js get-persons -p --page 100    

*/

program
  .command("get-persons")
  .description("Make a network request to fetch most popular persons")
  .requiredOption("-p, --popular", "Fetch the popular persons")
  .requiredOption(
    "--page, <number>",
    "The page of persons data results to fetch"
  )
  .action(async function handleAction(programOptions) {
    const spinner = ora("Fetching the popular person's data...").start();
    console.log("hello-world");

    requestOptions.path = `/3/person/popular?page=${programOptions.page}`;
    data = await getPersons(requestOptions);

    renderPersons(data);

    spinner.succeed("Popular persons data loaded");
  });

/*
************ test it with **************

node src/moviedb.js get-person -i 990393    

or

node src/moviedb.js get-person -i 1245 
*/
program
  .command("get-person")
  .description("Make a network request to fetch the data of a single person")
  .requiredOption("-i, --id", "The page of persons data results to fetch")
  .action(async function handleAction(programOptions) {
    const spinner = ora("Fetching the person's data...").start();
    const id = programOptions.args.toString();
    requestOptions.path = `/3/person/${id}`;

    data = await getPerson(requestOptions);

    renderPerson(data);

    spinner.succeed("Person data loaded");
  });

/*
************ test it with **************
1. popular movies : 
node src/moviedb.js get-movies --page 6
2. now playing movies : 
node src/moviedb.js get-movies -n --page 1 
*/

program
  .command("get-movies")
  .description("Make a network request to fetch movies")
  .requiredOption(
    "--page, <number>",
    "The page of movies data results to fetch"
  )
  .option("-p, --popular", "Fetch the popular movies")
  .option("-n, --now-playing", "Fetch the movies that are playing now")
  .action(async function handleAction(programOptions) {
    const spinner = ora("Fetching the movies data...").start();
    const page = programOptions.args.toString();
    let data = "";

    if (
      programOptions.popular ||
      (!programOptions.popular && !programOptions.nowPlaying)
    ) {
      requestOptions.path = `/3/movie/popular?page=${page}`;
      data = await getMovies(requestOptions);
      renderMovies(data, "Popular movies data loaded", spinner);
    } else if (programOptions.nowPlaying) {
      requestOptions.path = `/3/movie/now_playing?page=${page}`;
      data = await getMovies(requestOptions);
      renderMovies(data, "Movies playing now data loaded", spinner);
    }
  });

/*
************ test it with **************
node src/moviedb.js get-movie  --id 385128 -r
or
node src/moviedb.js get-movie  -i 385128 --review
*/
program
  .command("get-movie")
  .description("Make a network request to fetch the data of a single person")
  .requiredOption("-i, --id", "The id of the movie")
  .option("-r, --review", "Fetching the reviws of the movie")
  .action(async function handleAction(programOptions) {
    const spinner = ora("Fetching movie data...").start();
    const id = programOptions.args.toString();

    if (programOptions.r || programOptions.review) {
      requestOptions.path = `/3/movie/${id}/reviews`;
    } else {
      requestOptions.path = `/3/movie/${id}`;
    }

    data = await getMovie(requestOptions);
    renderMovie(programOptions.review, programOptions.r, id);
    spinner.succeed("Movie reviews data loaded");
  });

// error on unknown commands

program.parse(process.argv);
