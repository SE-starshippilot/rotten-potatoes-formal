import numpy as np
import pandas as pd 
import csv
# 爬虫写的太烂, 不运行这个tnnd一个导演对应不了多个电影，轻点喷，对不起。
def find(arr,num):
    for i in range(len(arr)):
        if num in arr[i]:
            return i
pd.set_option('display.max_rows', None)
director = pd.read_csv('data/directors.csv')
direct = np.array(pd.read_csv('data/direct.csv'))
duplicate = director.duplicated(subset='name')
print(len(duplicate) - sum(duplicate))
name_id = []
for i in range(len(duplicate)):
    if (not duplicate[i]):
        name_id.append(director[director['name'] == director.loc[i,'name']].loc[:,'id'].values.tolist())
for i in range(len(direct)):
    index = find(name_id,direct[i,1])
    direct[i,1] = index + 1
    director.loc[i,'id'] = index + 1
director = director[~duplicate]
director.loc[:,'id'].astype('int32')
director = director.values.tolist()

direct = list(direct)
with open('data/directors.csv', 'w', encoding='UTF8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['id', 'name', 'photo_url', 'introduction', 'birth_date'])
    writer.writerows(director)

with open('data/direct.csv', 'w', encoding='UTF8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['movie_id','director_id'])
    writer.writerows(direct)