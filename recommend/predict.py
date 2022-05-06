from matplotlib.pyplot import pause
import numpy as np
import lib

def getPredictedDistribution(v, w, wq, b, c, r, D):
    '''
    return a distribution over the ratings for movie q, given user data v
    v is a m x K matrix, where m is the number of movies in the dataset of the user
    w is the weights array for the user, m x F x K
    wq is the weight matrix for movie q, F x K
    b is the biases for movie q, 1 x K
    c is the biases for the hidden units, F
    '''
    posHiddenProb = lib.visibleToHiddenVec(v, w, c, r, D)
    sampleHidden = lib.sample(posHiddenProb)
    ret = np.zeros(wq.shape[1])
    for k in range(wq.shape[1]):
        for j in range(sampleHidden.size):
            ret[k] += sampleHidden[j] * wq[j, k]
        ret[k] += b[k]
    return lib.softmax(ret)

def predictRatingExp(ratingDistribution):
    # ratingDistribution is a probability distribution over possible ratings
    # return a rating from the distribution
    # We decide here that the predicted rating will be the expectation over
    # the ratingDistribution
    exp = 0
    for i in range(ratingDistribution.size):
        exp += ratingDistribution[i] * (i + 1)
    return exp

def predictRatingMax(ratingDistribution):
    #return a rating from the distribution
    # We decide here that the predicted rating will be the one with the highest probability
    currentMax = -1
    maxIdx = 0
    for i in range(ratingDistribution.size):
        if ratingDistribution[i] > currentMax:
            currentMax = ratingDistribution[i]
            maxIdx = i
    return maxIdx + 1

def predictForUser(user, W, b, c, D, training):
    # given a user ID, predicts all movie ratings for the user
    trStats = lib.getUsefulStats(training)
    ret = np.zeros(trStats["n_movies"])
    for i in range(ret.size):
        ret[i] = predictMovieForUser(i, user, W, b, c, D, training)
    return ret

def predictMovieForUser(q, user, W, b, c, D, training):
    '''
    q is movie idx
    user is user ID 
    '''
    ratingsForUser = lib.getRatingsForUser(user, training)
    v = lib.getV(ratingsForUser)
    r = lib.getRForUser(ratingsForUser, lib.getUsefulStats(training))
    ratingDist = getPredictedDistribution(v, W[ratingsForUser[:, 0], :, :], W[q, :, :], b[q, :], c, r, D)
    return predictRatingExp(ratingDist)

def predict(movies, users, W, b, c, D, training):
    return [predictMovieForUser(movie, user, W, b, c, D, training) for (movie, user) in zip(movies, users)]

# W = np.load("./recommend/modelData/weightMatrix.npy")
# b = np.load("./recommend/modelData/movieBias.npy")
# c = np.load("./recommend/modelData/hiddenBias.npy")
# D = np.load("./recommend/modelData/DMatrix.npy")

