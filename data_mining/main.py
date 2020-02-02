import pandas as pd
import os


def create_ss_df():
    rootdir = './names'
    df = pd.DataFrame()
    year = 1880
    for subdir, dirs, files in os.walk(rootdir):
        for file in files:
            title =  os.path.join(subdir, file)
            new_data = pd.read_csv(title, sep=",", header=None)
            new_data['year'] = year
            year += 1
            df = df.append(new_data)
    df.to_pickle("./ss_name_df.pkl")


def reorder_df():
    
    unpickled_df = pd.read_pickle("./ss_name_df.pkl")
    cols = unpickled_df.columns.tolist()
    cols = cols[-1:] + cols[:-1]
    unpickled_df = unpickled_df[cols]
    unpickled_df.columns = ['date', 'name', 'gender', 'value']
    unpickled_df.to_pickle("./ss_name_df.pkl")
    print unpickled_df

def write_to_csv():
    unpickled_df = pd.read_pickle("./ss_name_df.pkl")
    unpickled_df = unpickled_df[unpickled_df.value > 10000]
    unpickled_df.to_csv('ss_name_df.csv', index=False)
    
#create_ss_df()
#reorder_df()
#write_to_csv()