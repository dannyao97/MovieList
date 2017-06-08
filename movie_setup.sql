create table Movie (
   id integer auto_increment primary key,
   director varchar(50),
   duration integer,
   genre varchar(50),
   title  varchar(50) not null,
   movieLink varchar(75),
   language varchar(20),
   rating varchar(10),
   year integer,
   imdbScore float 
);
