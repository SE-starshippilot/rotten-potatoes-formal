# CSC 3170 presentation outline

## Data Gathering (crawler)

- Source: IMDB top 250
- Tool: Python+Beautiful Soup

## Database Design

### E-R

#### Entities:

- Movie
  - <u>ID</u>
  - Name
  - Cover URL
  - Introduction
  - Release year
  - Genres
- Director==ZSF==
  - 
- Actor
  - <u>ID</u>
  - Name
  - Gender
  - Photo URL
  - Birth Date
- User
  - 

#### Relations

- Movie--Character--Actor
- Movie--Direct--Director
- Movie--Comment--User

### Schema



## Front End

- amis

## Back End

- express

## Queries

- Login
- Register
- Movie Detail:
  - Actors/Directors of the movie
  - Rating a movie ==weighted rate==(todo)
- Actor Detail:
  - Movie participated in
- Add Comment:

- Search:
  - movie 
    - name
    - ==genres== (todo)
  - actor
    -  name
  - user 
    - name
- Filter 
  - movie:
    - Release year
    - Rate
  - actor
    - Birth date
- Sort:
  - movie:
    - Release year
    - Name
    - Rating
  - actor
    - Name
    - Birth date

## Data Analysis

### User Recommendation



