import sys
#Import will look like program_name, data_set name, csvfileName, table name 

table_name = "Movies"
f = open("new_movie_data.csv")
target = open("movies.sql", 'w')
values = f.readline().strip()
string_values = [0, 2, 3, 4, 5, 6]
for row in f:
   if row != "" and row != " ":
      row = row.strip()
      row_values = row.split(",")
      start_string = "INSERT INTO Movie(director, duration, genre, title, movieLink, language, rating, year, imdbScore) VALUES ( "
      for idx,val in enumerate(row_values):
         if (idx == 3):
            val = val.replace(" ", "_")
         if (idx in string_values):
            start_string += '"' + val + '", '
         else:
            start_string += val + ", "
      start_string = start_string[:len(start_string)-2] + ");\n"
   target.write(start_string)

target.close()
f.close()

