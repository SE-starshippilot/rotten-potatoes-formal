from sqlalchemy import create_engine
import numpy as np
import pandas as pd
from dotenv import load_dotenv, find_dotenv
import os

K = 10 # maximum rating

load_dotenv(find_dotenv('.env'))
env_dist = os.environ
enginePath = 'mysql+pymysql://%s:%s@%s:%s/%s'%(env_dist.get("DB_USER"), env_dist.get("DB_PASSWORD"), env_dist.get("DB_HOST"), env_dist.get("DB_PORT"), env_dist.get("DB_DATABASE"))
engine = create_engine(enginePath)

sql = "SELECT movie_id, user_id, rate FROM comments"

def getData():
    #df = pd.read_csv("./data/comments.csv")
    df = pd.read_sql_query(sql, engine)
    data = df[["movie_id", "user_id", "rate"]].to_numpy(dtype=np.int)
    for record in data:
        record[0] -= 1
        record[1] -= 1
    #print(df.head())
    return data

def getUsefulStats(training):
    movies = [x[0] for x in training]
    u_movies = np.unique(movies).tolist()

    users = [x[1] for x in training]
    u_users = np.unique(users).tolist()

    return {
        "movies": movies, # movie IDs
        "u_movies": u_movies, # unique movie IDs
        "n_movies": len(u_movies), # number of unique movies

        "users": users, # user IDs
        "u_users": u_users, # unique user IDs
        "n_users": len(u_users), # number of unique users

        "ratings": [x[2] for x in training], # ratings
        "n_ratings": len(training) # number of ratings
    }

def getRatingsForUser(user, training):
    '''
    user is a user ID
    training is the training set
    ret is a matrix, each row is [m, r] where
      m is the movie ID
      r is the rating, 1 to K
    '''
    return np.array([[x[0], x[2]] for x in training if x[1] == user])

def rmse(r, r_hat):
    r = np.array(r)
    r_hat = np.array(r_hat)
    return np.linalg.norm(r - r_hat) / np.sqrt(len(r))

def softmax(x):
    # Numerically stable softmax function
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum()

def getV(ratingsForUser):
    '''
    ratingsForUser is obtained from the ratings for user library
    return a binary matrix ret of size m x K, where m is the number of movies
      that the user has seen. ret[i][k] = 1 if the user
      has rated movie ratingsForUser[i, 0] with k stars
      otherwise it is 0
    '''
    ret = np.zeros((len(ratingsForUser), K))
    for i in range(len(ratingsForUser)):
        ret[i, ratingsForUser[i, 1]-1] = 1.0
    return ret

def getRForUser(ratingsForuser, trStats):
    r = np.zeros(trStats["n_movies"])
    for record in ratingsForuser:
        r[record[0]] = 1.0
    # conditional RBM is based on the fact that users watched some movies 
    # but the ratings are missing.
    # We do not know the information here, hence let r be 0 and 
    # do NOT use conditional RBM
    return np.zeros(trStats['n_movies'])

def sig(x):
    # x is a real vector of size n
    # ret should be a vector of size n where ret_i = sigmoid(x_i)
    # a numerically stable sigmoid function   
    return np.where(x < 0, np.exp(x)/(1 + np.exp(x)), 1/(1 + np.exp(-x)))

def probProduct(v, p):
    '''
    # v is a matrix of size m x K
    # p is a vector of size F, activation of the hidden units
    # returns the gradient for visible input v and hidden activations p, m x F x K
    '''
    ret = np.zeros((v.shape[0], p.size, v.shape[1]))
    for i in range(v.shape[0]):
        for j in range(p.size):
            for k in range(v.shape[1]):
                ret[i, j, k] = v[i, k] * p[j]
    return ret

def sample(p):
    '''
    # p is a vector of real numbers between 0 and 1
    # ret is a vector of same size as p, where ret_i = Ber(p_i)
    # In other word we sample from a Bernouilli distribution with
    # parameter p_i to obtain ret_i
    '''
    samples = np.random.random(p.size)
    return np.array(samples <= p, dtype=int)

def visibleToHiddenVec(v, w, c, r, D):
    '''
    v is a matrix of size m x K, ratings
    w is a list of matrices of size m x F x K
    c is the biases for the hidden units, vector with size F
    r is the binary vector of size M (all movies) in conditional RBM
    D is a matrix that models the effect of r on h, M x F
    '''
    ret = np.zeros(w.shape[1])
    for j in range(w.shape[1]):
        for i in range(w.shape[0]):
            for k in range(w.shape[2]):
                ret[j] += v[i, k] * w[i, j, k]
        ret[j] += c[j]    
    for j in range(w.shape[1]):
        for i in range(r.size):
            ret[j] += r[i] * D[i, j] 
    return sig(ret)

def hiddenToVisible(h, w, b):
    '''
    h is a binary vector of size F
    w is the weight matrix of size m x F x K
    b is the biases matrix of size m x K
    do reconstruction on the movies the user has seen 
    '''
    ret = np.zeros((w.shape[0], w.shape[2]))
    for i in range(w.shape[0]):
        for k in range(w.shape[2]):
            for j in range(h.size):
                ret[i, k] += h[j] * w[i, j, k]
            ret[i, k] += b[i, k]
        ret[i] = softmax(ret[i])
    return ret