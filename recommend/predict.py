import numpy as np
import lib
import sys

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


def trainModel(trData):
    trStats = lib.getUsefulStats(trData)
    rBar = np.mean(trStats["ratings"])

    A = np.zeros((trStats["n_ratings"], trStats["n_movies"] + trStats["n_users"]))
    # The i-th row is the i-th rating. Suppose it is user U for movie M.
    # In the i-th row, the U-th and ("n_users" + M)-th entries are both 1. 
    n_users = trStats["n_users"]
    for rows in range(len(trData)):
        data = trData[rows]
        movie = data[0]
        userID = data[1]
        A[rows][userID] = 1
        A[rows][movie+n_users] = 1
    c = trStats["ratings"] - rBar

    ATA = np.dot(A.T, A)
    RegularATA = ATA + 0 * np.eye(len(ATA))
    try:
        coeff = np.dot(np.linalg.inv(RegularATA), A.T)
    except:
        coeff = np.dot(np.linalg.pinv(RegularATA), A.T)
    return np.dot(coeff, c)

def predictAllRatingsForUser(userID, b, data):
    stats = lib.getUsefulStats(data)
    rBar = np.mean(stats["ratings"])
    predicted = {}
    for i in range(stats["n_movies"]):
        rating = rBar + b[userID - 1] + b[stats["n_users"] + i]
        if rating > 10: rating = 10.0
        if rating < 1: rating = 1.0
        predicted[i + 1] = rating
    for singleRate in data:
        if singleRate[1] == userID - 1:
            predicted.pop(singleRate[0] + 1)
    sortedPredictions = sorted(predicted.items(), key=lambda x: x[1], reverse=True)
    ret = ''
    for i in range(10):
        ret += str(sortedPredictions[i][0]) 
        if i != 9:
            ret += ' '
    #print(sortedPredictions)
    return ret

def recommendForUser(userID, data):
    weightMatrix = trainModel(data)
    allRatings = predictAllRatingsForUser(userID, weightMatrix, data)
    return allRatings

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

userID = int(sys.argv[1])
data = lib.getData()
print(recommendForUser(userID, data))