from matplotlib.pyplot import pause
import numpy as np
import lib
import predict as preLib

K = 10 #maximum rating

data = lib.getData()
#training = data[ : int(0.9 * len(data))]
#validation = data[int(0.9 * len(data)) : ]
training = data
trStats = lib.getUsefulStats(training)
#vlStats = lib.getUsefulStats(validation)

F = 5
batchSize = 200
epochs = 50

L = 30 # number of neighbours for reference
giveUpThreshold = 5

def getInitialWeights(m, F, K):
    return np.random.normal(0, 0.01, (m, F, K))

def trainRBM():
    log_interval = 8
    learningRates = [0.2,0.15,0.1,0.08,0.05,0.02,0.01,0.008,0.005,0.002,0.001,0.0005] 
    learningStage = 1
    T = 1

    # initialize all our parameters
    W = getInitialWeights(trStats["n_movies"], F, K)
    #visibleBiases = getInitialBiases(trStats, K)
    visibleBiases = np.zeros((trStats["n_movies"], K))
    hiddenBiases = np.zeros(F)
    r = np.zeros(trStats["n_movies"])
    D = np.zeros((trStats["n_movies"], F))
    posprods = np.zeros(W.shape)
    negprods = np.zeros(W.shape)
    gradientLearningRate = learningRates[0]

    for epoch in range(1, epochs + 1):
        visitingOrder = np.array(trStats["u_users"])
        np.random.shuffle(visitingOrder)
        grad = np.zeros(W.shape)
        gradB = np.zeros(visibleBiases.shape)
        gradC = np.zeros(hiddenBiases.size)
        gradD = np.zeros(D.shape)

        for user in visitingOrder[:batchSize]:
            ratingsForUser = lib.getRatingsForUser(user, training)
            v = lib.getV(ratingsForUser)
            weightsForUser = W[ratingsForUser[:, 0], :, :]
            biasesForUser = visibleBiases[ratingsForUser[:, 0], :]
            r = lib.getRForUser(ratingsForUser, trStats)

            negData = np.copy(v)

            for CDT in range(T):
                posHiddenProb = lib.visibleToHiddenVec(negData, weightsForUser, hiddenBiases, r, D)    
                posprods[ratingsForUser[:, 0], :, :] = lib.probProduct(v, posHiddenProb)
                sampleHidden = lib.sample(posHiddenProb)
                negData = lib.hiddenToVisible(sampleHidden, weightsForUser, biasesForUser)
                negHiddenProb = lib.visibleToHiddenVec(negData, weightsForUser, hiddenBiases, r, D)
                negprods[ratingsForUser[:, 0], :, :] = lib.probProduct(negData, negHiddenProb)

            grad[ratingsForUser[:, 0], :, :] += gradientLearningRate / batchSize * (posprods[ratingsForUser[:, 0], :, :] - negprods[ratingsForUser[:, 0], :, :])
            gradB[ratingsForUser[:, 0], :] += gradientLearningRate / batchSize * (v - negData)
            gradC += gradientLearningRate / batchSize * (posHiddenProb - negHiddenProb)
            gradD += gradientLearningRate / batchSize * np.outer(r, (posHiddenProb - negHiddenProb))

        W += grad
        visibleBiases += gradB
        hiddenBiases += gradC
        D += gradD

        if epoch%log_interval == 0:
            '''
            f = open("F=%d_Rate=%f_T=%d.txt"%(F, gradientLearningRate, T), "a+")
            print('epoch:', epoch, 'do calculation')
            D = np.zeros((trStats["n_movies"], F))
            tr_r_hat = predict(trStats["movies"], trStats["users"], W, visibleBiases, hiddenBiases, D, training)
            trRMSE = rmse(trStats["ratings"], tr_r_hat)
            vl_r_hat = predict(vlStats["movies"], vlStats["users"], W, visibleBiases, hiddenBiases, D, training)
            vlRMSE = rmse(vlStats["ratings"], vl_r_hat)
            f.write("### EPOCH %d ###\n" % epoch)
            f.write("Training loss = %f\n" % trRMSE)
            f.write("Validation loss = %f\n" % vlRMSE)
            f.close()
            '''
            print(epoch)
            T  = min(11, T + 2)
            gradientLearningRate = learningRates[learningStage]
            learningStage = min(learningStage + 1, len(learningRates) - 1)

    np.save("./recommend/modelData/weightMatrix.npy", W)
    np.save("./recommend/modelData/movieBias.npy", visibleBiases)
    np.save("./recommend/modelData/hiddenBias.npy", hiddenBiases)
    np.save("./recommend/modelData/DMatrix.npy", D)

    tr_r_hat = preLib.predict(trStats["movies"], trStats["users"], W, visibleBiases, hiddenBiases, D, training)
    trRMSE = lib.rmse(trStats["ratings"], tr_r_hat)
    print('training:', trRMSE)
'''
def getPredRforRBM():
    movie_num = trStats['n_movies']
    user_num = trStats['n_users']

    predR = np.zeros((user_num,movie_num))

    for m in range(movie_num):
        print('moive:', m)
        for u in range(user_num):
            predR[u, m] = preLib.predictMovieForUser(m, u, W, visibleBiases, hiddenBiases, D, training)

    return predR
'''
def getPredRforLinearRegression(rBar, b):
    predR = np.zeros((trStats["n_users"], trStats["n_movies"]))
    for u in range(predR.shape[0]):
        for m in range(predR.shape[1]):
            rating = rBar + b[u] + b[trStats["n_users"] + m]
            if rating > K: rating = K
            if rating < 1: rating = 1.0
            predR[u, m] = rating
    return predR


def neighbourHood(predR):

    movie_num = trStats['n_movies']
    user_num = trStats['n_users']
    realR = np.zeros((user_num,movie_num))
    biasR = np.zeros((user_num,movie_num))

    for data in training:
        realR[data[1], data[0]] = data[2]

    for m in range(movie_num):
        for u in range(user_num):
            if realR[u, m] != 0:
                biasR[u, m] = realR[u, m] - predR[u, m]

    # Similarity matrix, or correlation matrix, denotes cosine between two movies (later try 'users'). 
    # simMatrix(i,j) is the cos(movie_i, movie_j), where movie_i is the i-th column of biasR. 
    simMatrix = np.zeros((movie_num,movie_num))
    print('---similarity matrix initialized---')
    # simMatrix is symmetric, and it suffices to get a lower triangualr form.
    for i in range(movie_num):
        for j in range(i):
            if i != j:
                numerator = 0
                norm1 = 0
                norm2 = 0
                for u in range(user_num):
                    if biasR[u, i] != 0 and biasR[u, j] != 0:
                        numerator += biasR[u, i]*biasR[u, j]
                        norm1 += biasR[u, i]**2
                        norm2 += biasR[u, j]**2
                denumerator = (norm1*norm2)**(1/2)
                try:
                    simMatrix[i, j] = numerator/denumerator
                except:
                    simMatrix[i, j] = 0
    for i in range(movie_num):
        for j in range(i):
            simMatrix[j, i] = simMatrix[i, j]

    neighborRankDict = dict()
    for m in range(movie_num):
        neighborSim = [( abs(simMatrix[m,i]), i) for i in range(movie_num)]
        neighborSim.sort(reverse=True)
        # Sort similarity according to 1st entry of tuple. 
        neighborRankDict[m] = neighborSim
    
    correctionMatrix = np.zeros((user_num,movie_num))
    print('---correction matrix initialized---')
    for u in range(user_num):
        for m in range(movie_num):
            # Extract the similarity between 'm' and others.
            referNeighbor = neighborRankDict[m]
            # Only look at L-nearest neighbors.
            referNeighbor = referNeighbor[0:L]
            numerator = 0
            denumerator = 0
            count = 0
            for tu in referNeighbor:
                neighborID = tu[1]
                absSimilarity = tu[0]
                bias = biasR[u, neighborID]
                if bias != 0:
                    similarity = simMatrix[m, neighborID]
                    numerator += bias*similarity
                    denumerator += absSimilarity
                    count += 1
            if denumerator == 0 or count < giveUpThreshold:
                correction = 0
            else:
                correction = numerator/denumerator
            correctionMatrix[u, m] = correction
    
    newPredR = predR + correctionMatrix
    for m in range(movie_num):
        for u in range(user_num):
            if newPredR[u, m] > K:
                newPredR[u, m] = K
            if newPredR[u, m] < 1:
                newPredR[u, m] = 1
    print('---new predition made---')

    newTrainRMSE = 0
    for m in range(movie_num):
        for u in range(user_num):
            if realR[u, m] != 0:
                err = realR[u, m] - newPredR[u, m]
                newTrainRMSE += (err*err)
    newTrainRMSE = (newTrainRMSE/trStats["n_ratings"])**(1/2)
    print(newPredR)
    print(newTrainRMSE)

def linearPredict(movies, users, rBar, b):
    n_predict = len(users)
    p = np.zeros(n_predict)
    for i in range(0, n_predict):
        rating = rBar + b[users[i]] + b[trStats["n_users"] + movies[i]]
        if rating > K: rating = K
        if rating < 1: rating = 1.0
        p[i] = rating
    return p

def linearRegression(l):
    rBar = np.mean(trStats["ratings"])

    A = np.zeros((trStats["n_ratings"], trStats["n_movies"] + trStats["n_users"]))
    # The i-th row is the i-th rating. Suppose it is user U for movie M.
    # In the i-th row, the U-th and ("n_users" + M)-th entries are both 1. 
    n_users = trStats["n_users"]
    for rows in range(len(training)):
        data = training[rows]
        movie = data[0]
        userID = data[1]
        A[rows][userID] = 1
        A[rows][movie+n_users] = 1
    c = trStats["ratings"] - rBar

    ATA = np.dot(A.T, A)
    RegularATA = ATA + l * np.eye(len(ATA))
    coeff = np.dot(np.linalg.inv(RegularATA), A.T)
    b = np.dot(coeff, c)

    error = lib.rmse(linearPredict(trStats["movies"], trStats["users"], rBar, b), trStats["ratings"])

    #print("RMSE for linear regression:", error)
    
    #neighbourHood(getPredRforLinearRegression(rBar, b))
    
#linearRegression(0)    

#trainRBM()

#W = np.load("./recommend/modelData/weightMatrix.npy")
#visibleBiases = np.load("./recommend/modelData/movieBias.npy")
#hiddenBiases = np.load("./recommend/modelData/hiddenBias.npy")
#D = np.load("./recommend/modelData/DMatrix.npy")
#print(W[0])
#print(visibleBiases)
#print(hiddenBiases)
'''
tr_r_hat = preLib.predict(trStats["movies"], trStats["users"], W, visibleBiases, hiddenBiases, D, training)
print(tr_r_hat)
trRMSE = lib.rmse(trStats["ratings"], tr_r_hat)
print(trRMSE)
'''

#neighbourHood(getPredRforRBM())

