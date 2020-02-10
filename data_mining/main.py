import pandas as pd
import os
import re


def create_ss_df():
    rootdir = './names'
    df = pd.DataFrame()
    year = 1880
    for subdir, dirs, files in os.walk(rootdir):
        for file in files:
            title =  os.path.join(subdir, file)
            year = re.findall(r'\d{4}', title)
            year = int(year[0])
            new_data = pd.read_csv(title, sep=",", header=None)
            new_data.columns = ['name', 'gender', 'value']
            new_data['date'] = year
            print year
            print new_data
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
    unpickled_df = unpickled_df[unpickled_df.value > 3000]
    unpickled_df.sort_values(by=['date'], ascending=True)
    unpickled_df.to_csv('temp.csv', index=False)
    
create_ss_df()
reorder_df()
write_to_csv()
