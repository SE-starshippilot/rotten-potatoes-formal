from bs4 import BeautifulSoup
import requests
import csv
import string    
import random
import traceback 
from datetime import datetime

requests.adapters.DEFAULT_RETRIES = 20
s = requests.session()
s.keep_alive = False

base_url = 'https://www.imdb.com'

def visit_page(url):
    return BeautifulSoup(s.get(base_url + url, timeout=120).text, 'lxml')

def to_original_resolution(url):
    return url[0:url.find('_V1_')] + '_V1_.jpg'

def random_password():
    return str(''.join(random.choices(string.ascii_letters + string.digits, k = random.randint(5, 10)))) 

# movies_data = []
actors_data = []
# genres_data = []
# users_data = []
characters_data = []
# comments_data = []

num_of_movies = 200
num_of_actors_per_movie = 20
num_of_comments_per_movie = 20

movie_id = 1
actor_id = 1
user_id = 1
character_id = 1
comment_id = 1

actor_name_to_id = {}
user_name_to_id = {}

home_page = visit_page('/chart/top/')
movies = home_page.find('tbody', class_='lister-list').find_all('tr')
for movie in movies:
    if movie_id > num_of_movies:
        break
    try:
        curr_genres = []
        movie_name = movie.find('td', class_='titleColumn').a.text
        # cover_url = movie.find('td', class_='posterColumn').a.img.attrs['src']
        # cover_url = to_original_resolution(cover_url)
        # release_year = movie.find('td', class_='titleColumn').span.text[1:5]
        movie_page_url = movie.find('td', class_='titleColumn').a.attrs['href']
        movie_page = visit_page(movie_page_url)
        # genre_tags = movie_page.find("div", {"data-testid":"genres"})
        # for tag in genre_tags.findChildren("li"):
        #     curr_genres.append(tag.text)
        # introduction = movie_page.find('span', {'data-testid': 'plot-xl'}).text
        actors = movie_page.find_all('div', {'data-testid': 'title-cast-item'})
        # comments_page_url = movie_page.find('section', {'data-testid': 'UserReviews'}).find('div', {'data-testid': 'reviews-header'}).a.attrs['href']
        # comments_page = visit_page(comments_page_url)
        # comments = comments_page.find_all('div', class_='lister-item-content')
    except requests.exceptions.ConnectionError as cexcep:
        print('Maximum connection time reached')
    except requests.exceptions.RequestException as rexcep:
        print('Connection overtime')
    except KeyboardInterrupt as ke:
        break
    else:
        # print(f'Movie Data:    id:{movie_id}  name:{movie_name}  release:{release_year}')
        # movies_data.append([movie_id, movie_name, cover_url, introduction, release_year])
        # for genres in curr_genres:
        #     genres_data.append([movie_id, genres])
        prev_actor_id = actor_id
        for actor in actors:
            if actor_id - prev_actor_id >= num_of_actors_per_movie:
                break
            name_tag = actor.find('a', {'data-testid': 'title-cast-item__actor'})
            actor_name = name_tag.text
            photo_url = actor.find('img')
            if photo_url == None:
                continue
            photo_url = to_original_resolution(photo_url.attrs['src'])
            character_names = []
            for character in actor.find_all('li'):
                if character.a != None:
                    character_names.append(character.a.span.text)
            actor_page_url = name_tag.attrs['href']
            actor_page = visit_page(actor_page_url)
            introduction = actor_page.find('div', {'id': 'name-bio-text'}).div.div.contents[0]
            try:
                birth_date = actor_page.find('div', {'id': 'name-born-info'}).time.attrs['datetime']
            except AttributeError:
                birth_date = 'Null'
            gender_field = actor_page.find(text=['Actor', 'Actress'])
            isFemale = 1 if 'Actress' in gender_field else 0
            if actor_name in actor_name_to_id:
                for character_name in character_names:
                    characters_data.append([character_id, character_name, movie_id, actor_name_to_id[actor_name]])
                    character_id = character_id + 1
            else:
                for character_name in character_names:
                    characters_data.append([character_id, character_name, movie_id, actor_id])
                    character_id = character_id + 1
                print(f'actor_id:{actor_id} actor_name:{actor_name} isFemale:{isFemale} birth_date:{birth_date}')
                actors_data.append([actor_id, actor_name, isFemale, photo_url, introduction, birth_date])
                actor_name_to_id[actor_name] = actor_id
                actor_id = actor_id + 1
        # prev_comment_id = comment_id
        # for comment in comments:
        #     if comment_id - prev_comment_id >= num_of_comments_per_movie:
        #         break
        #     try:
        #         rate = comment.find('div', class_='ipl-ratings-bar').span.span.text
        #         comment_date = datetime.strptime(comment.find('div', class_='display-name-date').find('span', class_='review-date').text, '%d %B %Y').date()
        #         content = comment.find('div', class_='content').div.text
        #         user_page_url = comment.find('div', class_='display-name-date').find('span', class_='display-name-link').a.attrs['href']
        #         user_page = visit_page(user_page_url)
        #         user_profile = user_page.find('div', class_='user-profile').div
        #         user_name = user_profile.find('h1').text
        #         avatar_url = to_original_resolution(user_profile.find('div', {'id': 'avatar-frame'}).img.attrs['src'])
        #     except:
        #         print(traceback.format_exc())
        #     else:
        #         if user_name in user_name_to_id:
        #             comments_data.append([comment_id, rate, content, comment_date, movie_id, user_name_to_id[user_name]])
        #             comment_id = comment_id + 1
        #         else:
        #             comments_data.append([comment_id, rate, content, comment_date, movie_id, user_id])
        #             comment_id = comment_id + 1
        #             users_data.append([user_id, user_name, avatar_url, random_password()])
        #             user_name_to_id[user_name] = user_id
        #             user_id = user_id + 1
        movie_id = movie_id + 1
# with open('data/genres.csv', 'w', encoding='UTF8', newline='') as f:
#     writer = csv.writer(f)
#     writer.writerow(['movie_id', 'genres'])
#     writer.writerows(genres_data)

# with open('data/movies.csv', 'w', encoding='UTF8', newline='') as f:
#     writer = csv.writer(f)
#     writer.writerow(['id', 'name', 'cover_url', 'introduction', 'release_year'])
#     writer.writerows(movies_data)
    
with open('data/actors.csv', 'w', encoding='UTF8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['id', 'isFemale', 'name', 'photo_url', 'introduction', 'birth_date'])
    writer.writerows(actors_data)
    
# with open('data/users.csv', 'w', encoding='UTF8', newline='') as f:
#     writer = csv.writer(f)
#     writer.writerow(['id', 'name', 'avatar_url', 'password'])
#     writer.writerows(users_data)
    
with open('data/characters.csv', 'w', encoding='UTF8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['id', 'character_name', 'movie_id', 'actor_id'])
    writer.writerows(characters_data)
    
# with open('data/comments.csv', 'w', encoding='UTF8', newline='') as f:
#     writer = csv.writer(f)
#     writer.writerow(['id', 'rate', 'content', 'comment_date', 'movie_id', 'user_id'])
#     writer.writerows(comments_data)
