/* Replace with your SQL commands */
CREATE TABLE atgusers
(
    id SERIAL PRIMARY KEY, -- primary key column
    username VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    PASSWORD VARCHAR NOT NULL
);