drop database if exists dsyao;
create database dsyao;
use dsyao;

create table Person (
   id int auto_increment primary key,
   firstName varchar(30),
   lastName varchar(30) not null,
   email varchar(30) not null,
   password varchar(50),
   whenRegistered datetime not null,
   termsAccepted datetime,
   role int unsigned not null,  # 0 normal, 1 admin
   unique key(email)
);

insert into Person (firstName, lastName, email,       password,   whenRegistered, role)
            VALUES ("Joe",     "Admin", "adm@11.com", "password", NOW(), 1);


create table MovieList (
   id int auto_increment primary key,
   title varchar(80),
   ownerId int
);

create table Entry (
   id int auto_increment primary key,
   listId int not null,
   movieId int not null,
   prsId int not null,
   whenAdded datetime not null,
   # constraint FKEntry_movieId foreign key (movieId) references Movie(id)
    # on delete cascade,
   constraint FKEntry_prsId foreign key (prsId) references Person(id)
    on delete cascade
);

source movie_setup.sql;
source movies.sql;
