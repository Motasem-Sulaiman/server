DROP TABLE IF EXISTS addmovie;
CREATE TABLE IF NOT EXISTS addmovie(
id SERIAL PRIMARY KEY,
title varchar(255),
release_date varchar(255),
poster_path varchar(255),
comments varchar(255)

);