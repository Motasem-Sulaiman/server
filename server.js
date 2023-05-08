"use strict";
require("dotenv").config();
const express = require("express");
const movieKey = process.env.API_KEY;
const pg=require("pg");
const client=new pg.Client(process.env.DATABASE_URL);
const axios = require("axios");
const moviesData = require("./Movie Data/data.json");
const server = express();
let newArr = [];
const port = 3001;
const cors = require("cors");
server.use(cors());
server.use(express.json());

function MoviesApi(id, title, release_date, poster_path, overview) {
  this.id = id;
  this.title = title;
  this.release_date = release_date;
  this.poster_path = poster_path;
  this.overview = overview;

  newArr.push(this);
}

function Movies(title, poster_path, overview, id, vote_average) {
  this.title = title;
  this.poster_path = poster_path;
  this.overview = overview;
  this.id = id;
  this.vote_average = vote_average;
}



server.get("/trending", getMovies);
server.get("/search", searchMovies);
server.get("/now_playing", nowPlaying);
server.get("/top_rated", topRated);
server.get("/getMovies",getMoviesDb);
server.post("/addMovie",addMovieDb);
server.delete("/DELETE/:id",deleteMovie)
server.put("/UPDATE/:id",UpdateMovie)
server.get("/getMovie/:id",getOneMovie)


function deleteMovie(req,res){
const deleteMov=req.params.id;
const sql=`delete from addmovie where id=${deleteMov};`
client.query(sql).then((data)=>{


res.send("Movie deleted")



})

}


function getOneMovie(req,res){
const getMovie=req.params.id
const sql=`select * from addmovie where id=${getMovie};`
client.query(sql).then((data)=>{





  res.send(data.rows)
})




}

function UpdateMovie(req,res){

const update=req.params.id
const sql=`update addmovie set comments=$1 where id=${update} returning* ;`
const values=[req.body.comments]
client.query(sql,values).then((data)=>{


res.send("Comment Updated")


})




}

function addMovieDb(req, res) {
  const movie = req.body;
  const sql = `INSERT INTO addmovie (title, release_date, poster_path,comments) 
     values ('${movie.title}', '${movie.release_date}', '${movie.poster_path}','${movie.comments}')RETURNING*;`;

  client.query(sql).then((data) => {
    res.send(data.rows);
  });
}


function getMoviesDb(req,res){

const sql='select * from addmovie;';
client.query(sql).then((data)=>{


res.send(data.rows)




})



}





function topRated(req, res) {
  const url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${movieKey}`;

  axios.get(url).then((result) => {
    res.send(result.data);
  });
}

function searchMovies(req, res) {
  let searchByName = req.query.query;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${movieKey}&query=${searchByName}`;

  axios.get(url).then((result) => {
    res.send(result.data);
  });
}

function nowPlaying(req, res) {
  const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${movieKey}`;
  axios.get(url).then((result) => {
    res.send(result.data);
  });
}

async function getMovies(req, res) {
  const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${movieKey}&language=en-US`;

  let movieFromAPI = await axios.get(url);
  let newMovie = movieFromAPI.data.results.map((item) => {
    return new MoviesApi(
      item.id,
      item.title,
      item.release_date,
      item.poster_path,
      item.overview
    );
  });
  res.send(newMovie);
}

server.get("/", (req, res) => {
  const data = new Movies(
    moviesData.title,
    moviesData.poster_path,
    moviesData.overview,
    moviesData.id,
    moviesData.vote_average
  );
  res.json(data);
});

server.get("/favorite", (req, res) => {
  res.send("Welcome to Favorite Page");
});

function notFound(req, res) {
  res.status(404).send({
    status: 404,
    responseText: "Page not found, please write the correct path",
  });
}

function serverErorr(req, res) {
  res.status(500).send({
    status: 500,
    responseText: "Sorry, something went wrong",
  });
}

server.use(notFound);
server.use(serverErorr);


client.connect().then(()=>{


  server.listen(port, () => {
    console.log(`server port is ${port}`);
  });


})

