# -*- coding: utf-8 -*-
"""preprocessing.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1bzYYhHEIeczR6K4t2K1Ds8ChhU9F-lKr

# Our Team's Preprocessing Info

## Introduction

*   Removal of rows with missing values
*   Replacement of missing values with default values
*   Detection of entity resolution problems
*   Simple entity resolution
*   Removal of unpaired entities
*   Replacement of categorical variables with indicators
*   Identification of candidate indices
*   Data exportation

## Setup

Run the cell below to import necessary modules.
"""

import numpy as np
import pandas as pd
from google.colab import drive

"""
To prepare the datasets for ingestion into the database, we need to:
1. Clean missing / misentered values
2. Detect and solve entity resolution problems
3. Replace categorical variables with numeric indicators for efficiency
4. Export the data

Before doing any of this, we need to import the datasets to _pandas_ `DataFrames`. We'll follow the data importation procedure outlined in the [EDA tutorial](https://drive.google.com/open?id=1Cy3izai9zLQYTCTQF9IwkcuLmNArcKZO). Add the datasets to your Google Drive using the links above, then mount your Drive to the notebook by running the cell below."""

prefix = '/content/drive'
from google.colab import drive
drive.mount(prefix, force_remount=True)

"""Finally, run the cell below to load the census data into a `DataFrame` named `census` and the life expectancy data into a `DataFrame` named `le`."""

s_bundesliga = pd.read_csv("/content/drive/My Drive/trades_data/1-bundesliga.csv")
s_champ = pd.read_csv("/content/drive/My Drive/trades_data/championship.csv")
s_eredivisie = pd.read_csv("/content/drive/My Drive/trades_data/eredivisie.csv")
s_liganos = pd.read_csv("/content/drive/My Drive/trades_data/liga-nos.csv")
s_ligue1 = pd.read_csv("/content/drive/My Drive/trades_data/ligue-1.csv")
s_premierleague = pd.read_csv("/content/drive/My Drive/trades_data/premier-league.csv")
s_premierliga = pd.read_csv("/content/drive/My Drive/trades_data/premier-liga.csv")
s_primeradiv = pd.read_csv("/content/drive/My Drive/trades_data/primera-division.csv")
s_seriea = pd.read_csv("/content/drive/My Drive/trades_data/serie-a.csv")

t_appearances = pd.read_csv("/content/drive/My Drive/transfermarkt_data/appearances.csv")
t_clubgames = pd.read_csv("/content/drive/My Drive/transfermarkt_data/club_games.csv")
t_clubs = pd.read_csv("/content/drive/My Drive/transfermarkt_data/clubs.csv")
t_comps = pd.read_csv("/content/drive/My Drive/transfermarkt_data/competitions.csv")
t_events = pd.read_csv("/content/drive/My Drive/transfermarkt_data/game_events.csv")
t_games = pd.read_csv("/content/drive/My Drive/transfermarkt_data/games.csv")
t_playerval = pd.read_csv("/content/drive/My Drive/transfermarkt_data/player_valuations.csv")
t_players = pd.read_csv("/content/drive/My Drive/transfermarkt_data/players.csv")

"""## Clean Missing Values

1. Clubs.csv: remove rows with no club name, create new column called “transfer_euros” with cleaned net_transfer_record data (remove currency symbol, replace abbreviations with appropriate multiple)
2. Players.csv: for the players who are known by a single name (empty first name), replace the empty first name with the entry in last name and replace the last name entry with “”
3. all trades .csv files replace ‘NA’ in fee_cleaned with -1, since there is no negative fee values in the column and we have a column referring to if the fee transfer amount is in/out
"""

def convert_transfer(record):
    if record == "+-0":
        return 0
    elif 'm' in record:
        return float(record.replace('€', '').replace('m', '')) * 1e6
    elif 'k' in record:
        return float(record.replace('€', '').replace('k', '')) * 1e3
    else:
        return float(record.replace('€', ''))

missing_country_ids = set(t_clubs[t_clubs['name'].isna()]['club_id'].tolist())
t_clubs = t_clubs[t_clubs['name'].notna()] #remove rows without country

t_players.drop(t_players[t_players['current_club_id'].isin(missing_country_ids)].index, inplace=True)
t_playerval.drop(t_playerval[t_playerval['current_club_id'].isin(missing_country_ids)].index, inplace=True)
t_games.drop(t_games[t_games['home_club_id'].isin(missing_country_ids)].index, inplace=True)
t_games.drop(t_games[t_games['away_club_id'].isin(missing_country_ids)].index, inplace=True)
t_events.drop(t_events[t_events['club_id'].isin(missing_country_ids)].index, inplace=True)
t_clubgames.drop(t_clubgames[t_clubgames['club_id'].isin(missing_country_ids)].index, inplace=True)
t_appearances.drop(t_appearances[t_appearances['player_club_id'].isin(missing_country_ids)].index, inplace=True)
t_appearances.drop(t_appearances[t_appearances['player_current_club_id'].isin(missing_country_ids)].index, inplace=True)

t_clubs = t_clubs.drop(columns =['total_market_value', 'coach_name'])
t_clubs['transfer_euros'] = t_clubs['net_transfer_record'].apply(convert_transfer)
t_clubs

t_players['single'] = (t_players['first_name'].isnull()) & ~(t_players['last_name'].isnull())

t_players['first_name'] = t_players.apply(lambda row: row['last_name'] if row['single'] else row['first_name'], axis=1)
t_players['last_name'] = t_players.apply(lambda row: '' if row['single'] else row['last_name'], axis=1)

t_players = t_players[~(t_players['first_name'].isnull() & t_players['last_name'].isnull())]
t_players = t_players.drop(columns =['single'])
t_players

s_bundesliga['fee_cleaned'].fillna(-1, inplace=True)
s_champ['fee_cleaned'].fillna(-1, inplace=True)
s_eredivisie['fee_cleaned'].fillna(-1, inplace=True)
s_liganos['fee_cleaned'].fillna(-1, inplace=True)
s_ligue1['fee_cleaned'].fillna(-1, inplace=True)
s_premierleague['fee_cleaned'].fillna(-1, inplace=True)
s_premierliga['fee_cleaned'].fillna(-1, inplace=True)
s_primeradiv['fee_cleaned'].fillna(-1, inplace=True)
s_seriea['fee_cleaned'].fillna(-1, inplace=True)

s_bundesliga

"""## Entity Resolution

Now that we've handled missing values in both datasets, we turn our attention to performing entity resolution on the entities common to both. In this case, those common entities are clubs.

To perform entity resolution, we will:
1. Determine whether both datasets use the same names to refer to all clubs
2. Edit the names in one dataset to match the other, if necessary

In the general case, you may also need to detect when datasets refer to different entities using the same name/ID and disambiguate these references. This may happen when handling datasets that contain multiple people with the same name, for example. But we don't need to worry about it here because the names of clubs are well-known and distict.

### Detect Inconsistent Names
Let's compile a list of all club names in both datasets, then inspect it for repetitions.

First, we extract the unique names of countries from both datasets.
"""

#find club names datasets

bundsliga_names = s_bundesliga["club_name"].unique()
champ_names = s_champ["club_name"].unique()
eredivisie_names = s_eredivisie["club_name"].unique()
liganos_names = s_liganos["club_name"].unique()
ligue1_names = s_ligue1["club_name"].unique()
premierleague_names = s_premierleague["club_name"].unique()
premierliga_names = s_premierliga["club_name"].unique()
primeradiv_names = s_primeradiv["club_name"].unique()
seria_names = s_seriea["club_name"].unique()

bundsliga_names2 = s_bundesliga["club_involved_name"].unique()
champ_names2 = s_champ["club_involved_name"].unique()
eredivisie_names2 = s_eredivisie["club_involved_name"].unique()
liganos_names2 = s_liganos["club_involved_name"].unique()
ligue1_names2 = s_ligue1["club_involved_name"].unique()
premierleague_names2 = s_premierleague["club_involved_name"].unique()
premierliga_names2 = s_premierliga["club_involved_name"].unique()
primeradiv_names2 = s_primeradiv["club_involved_name"].unique()
seria_names2 = s_seriea["club_involved_name"].unique()

s_names = set(bundsliga_names.tolist() + champ_names.tolist() + eredivisie_names.tolist() + liganos_names.tolist() + ligue1_names.tolist() + premierleague_names.tolist() + premierliga_names.tolist() + primeradiv_names.tolist() + seria_names.tolist() + bundsliga_names2.tolist() + champ_names2.tolist() + eredivisie_names2.tolist() + liganos_names2.tolist() + ligue1_names2.tolist() + premierleague_names2.tolist() + premierliga_names2.tolist() + primeradiv_names2.tolist() + seria_names2.tolist())

t_names = set(t_clubs["name"].unique())

"""Now, we combine these into one set."""

#find set difference in club names

result_set = s_names.symmetric_difference(t_names)
result_set

import re

def revise_string(s):
    #remove hypens
    s = s.replace('-', ' ')
    #remove anything in parenthesis, including the parentheses
    s = re.sub(r'\([^)]*\)', '', s)
    #remove all numbers
    s = re.sub(r'\d+', '', s)
    #remove periods
    s = s.replace('.', '')
    #remove double spaces
    s = re.sub(r'\s+', ' ', s)
    #remove extra spaces at the front and end
    s = s.strip()
    return s

revised_s_names = {revise_string(s) for s in s_names}
revised_t_names = {revise_string(s) for s in t_names}
result_set2 = revised_s_names.symmetric_difference(revised_t_names)
result_set2

t_clubs['name'] = t_clubs['name'].apply(revise_string)
s_bundesliga['club_name'] = s_bundesliga['club_name'].apply(revise_string)
s_champ['club_name'] = s_champ['club_name'].apply(revise_string)
s_eredivisie['club_name'] = s_eredivisie['club_name'].apply(revise_string)
s_liganos['club_name'] = s_liganos['club_name'].apply(revise_string)
s_ligue1['club_name'] = s_ligue1['club_name'].apply(revise_string)
s_premierleague['club_name'] = s_premierleague['club_name'].apply(revise_string)
s_premierliga['club_name'] = s_premierliga['club_name'].apply(revise_string)
s_primeradiv['club_name'] = s_primeradiv['club_name'].apply(revise_string)
s_seriea['club_name'] = s_seriea['club_name'].apply(revise_string)

s_bundesliga['club_involved_name'] = s_bundesliga['club_involved_name'].apply(revise_string)
s_champ['club_involved_name'] = s_champ['club_involved_name'].apply(revise_string)
s_eredivisie['club_involved_name'] = s_eredivisie['club_involved_name'].apply(revise_string)
s_liganos['club_involved_name'] = s_liganos['club_involved_name'].apply(revise_string)
s_ligue1['club_involved_name'] = s_ligue1['club_involved_name'].apply(revise_string)
s_premierleague['club_involved_name'] = s_premierleague['club_involved_name'].apply(revise_string)
s_premierliga['club_involved_name'] = s_premierliga['club_involved_name'].apply(revise_string)
s_primeradiv['club_involved_name'] = s_primeradiv['club_involved_name'].apply(revise_string)
s_seriea['club_involved_name'] = s_seriea['club_involved_name'].apply(revise_string)

"""The output contains clubs with multiple names:

*   'Saturn REN TV Ramenskoe' and 'Saturn Ramenskoe'
*   'Spartak Alania Vladikavkaz' and 'Spartak Vladikavkaz'
*   'Genoa' and 'Genoa CFC'
*   'FC Nizhniy Novgorod' and 'FC Pari Nizhniy Novgorod'

### Resolve Inconsistent Names

We first create a `Series` of the countries with multiple names, where of each element is the name we'll purge, and the value is name we'll keep.
"""

name_map = {
    'Saturn Ramenskoe' : 'Saturn REN TV Ramenskoe',
    'Spartak Vladikavkaz' : 'Spartak Alania Vladikavkaz',
    'Genoa' : 'Genoa CFC',
    'FC Nizhniy Novgorod' : 'FC Pari Nizhniy Novgorod',
}
name_series = pd.Series(data=list(name_map.values()), index=list(name_map.keys()))
name_series

"""Next, we find the indices of all usages of the names we're purging in both datasets"""

purge_list = list(name_map.keys())

t_idx = t_clubs.index[t_clubs["name"].isin(purge_list)]
s_bundesliga_idx = s_bundesliga.index[s_bundesliga["club_name"].isin(purge_list)]
s_champ_idx = s_champ.index[s_champ["club_name"].isin(purge_list)]
s_eredivisie_idx = s_eredivisie.index[s_eredivisie["club_name"].isin(purge_list)]
s_liganos_idx = s_liganos.index[s_liganos["club_name"].isin(purge_list)]
s_ligue1_idx = s_ligue1.index[s_ligue1["club_name"].isin(purge_list)]
s_premierleague_idx = s_premierleague.index[s_premierleague["club_name"].isin(purge_list)]
s_premierliga_idx = s_premierliga.index[s_premierliga["club_name"].isin(purge_list)]
s_primeradiv_idx = s_primeradiv.index[s_primeradiv["club_name"].isin(purge_list)]
s_seriea_idx = s_seriea.index[s_seriea["club_name"].isin(purge_list)]

s_bundesliga_idx2 = s_bundesliga.index[s_bundesliga["club_involved_name"].isin(purge_list)]
s_champ_idx2 = s_champ.index[s_champ["club_involved_name"].isin(purge_list)]
s_eredivisie_idx2 = s_eredivisie.index[s_eredivisie["club_involved_name"].isin(purge_list)]
s_liganos_idx2 = s_liganos.index[s_liganos["club_involved_name"].isin(purge_list)]
s_ligue1_idx2 = s_ligue1.index[s_ligue1["club_involved_name"].isin(purge_list)]
s_premierleague_idx2 = s_premierleague.index[s_premierleague["club_involved_name"].isin(purge_list)]
s_premierliga_idx2 = s_premierliga.index[s_premierliga["club_involved_name"].isin(purge_list)]
s_primeradiv_idx2 = s_primeradiv.index[s_primeradiv["club_involved_name"].isin(purge_list)]
s_seriea_idx2 = s_seriea.index[s_seriea["club_involved_name"].isin(purge_list)]

"""Using these indices, we extract the names that we need to update as `Series`"""

t_problems = t_clubs.loc[t_idx, "name"]
s_bundesliga_problems = s_bundesliga.loc[s_bundesliga_idx, "club_name"]
s_champ_problems = s_champ.loc[s_champ_idx, "club_name"]
s_eredivisie_problems = s_eredivisie.loc[s_eredivisie_idx, "club_name"]
s_liganos_problems = s_liganos.loc[s_liganos_idx, "club_name"]
s_ligue1_problems = s_ligue1.loc[s_ligue1_idx, "club_name"]
s_premierleague_problems = s_premierleague.loc[s_premierleague_idx, "club_name"]
s_premierliga_problems = s_premierliga.loc[s_premierliga_idx, "club_name"]
s_primeradiv_problems = s_primeradiv.loc[s_primeradiv_idx, "club_name"]
s_seriea_problems = s_seriea.loc[s_seriea_idx, "club_name"]

s_bundesliga_problems2 = s_bundesliga.loc[s_bundesliga_idx2, "club_involved_name"]
s_champ_problems2 = s_champ.loc[s_champ_idx2, "club_involved_name"]
s_eredivisie_problems2 = s_eredivisie.loc[s_eredivisie_idx2, "club_involved_name"]
s_liganos_problems2 = s_liganos.loc[s_liganos_idx2, "club_involved_name"]
s_ligue1_problems2 = s_ligue1.loc[s_ligue1_idx2, "club_involved_name"]
s_premierleague_problems2 = s_premierleague.loc[s_premierleague_idx2, "club_involved_name"]
s_premierliga_problems2 = s_premierliga.loc[s_premierliga_idx2, "club_involved_name"]
s_primeradiv_problems2 = s_primeradiv.loc[s_primeradiv_idx2, "club_involved_name"]
s_seriea_problems2 = s_seriea.loc[s_seriea_idx2, "club_involved_name"]

"""Next, we replace the problematic names in these `Series` with the appropriate counterparts by indexing `name_series` with them.

*The operations in the cell below replace the names correctly because `name_series` maps each name we wanted to purge to the we wanted to replace it with.*
"""

t_fixed = name_series.loc[t_problems.values].values
s_bundesliga_fixed = name_series.loc[s_bundesliga_problems.values].values
s_champ_fixed = name_series.loc[s_champ_problems.values].values
s_eredivisie_fixed = name_series.loc[s_eredivisie_problems.values].values
s_liganos_fixed = name_series.loc[s_liganos_problems.values].values
s_ligue1_fixed = name_series.loc[s_ligue1_problems.values].values
s_premierleague_fixed = name_series.loc[s_premierleague_problems.values].values
s_premierliga_fixed = name_series.loc[s_premierliga_problems.values].values
s_primeradiv_fixed = name_series.loc[s_primeradiv_problems.values].values
s_seriea_fixed = name_series.loc[s_seriea_problems.values].values

s_bundesliga_fixed2 = name_series.loc[s_bundesliga_problems2.values].values
s_champ_fixed2 = name_series.loc[s_champ_problems2.values].values
s_eredivisie_fixed2 = name_series.loc[s_eredivisie_problems2.values].values
s_liganos_fixed2 = name_series.loc[s_liganos_problems2.values].values
s_ligue1_fixed2 = name_series.loc[s_ligue1_problems2.values].values
s_premierleague_fixed2 = name_series.loc[s_premierleague_problems2.values].values
s_premierliga_fixed2 = name_series.loc[s_premierliga_problems2.values].values
s_primeradiv_fixed2 = name_series.loc[s_primeradiv_problems2.values].values
s_seriea_fixed2 = name_series.loc[s_seriea_problems2.values].values

"""Finally, we update the dataframes with the fixed names."""

t_clubs.loc[t_idx, "name"] = t_fixed
s_bundesliga.loc[s_bundesliga_idx, "club_name"] = s_bundesliga_fixed
s_champ.loc[s_champ_idx, "club_name"] = s_champ_fixed
s_eredivisie.loc[s_eredivisie_idx, "club_name"] = s_eredivisie_fixed
s_liganos.loc[s_liganos_idx, "club_name"] = s_liganos_fixed
s_ligue1.loc[s_ligue1_idx, "club_name"] = s_ligue1_fixed
s_premierleague.loc[s_premierleague_idx, "club_name"] = s_premierleague_fixed
s_premierliga.loc[s_premierliga_idx, "club_name"] = s_premierliga_fixed
s_primeradiv.loc[s_primeradiv_idx, "club_name"] = s_primeradiv_fixed
s_seriea.loc[s_seriea_idx, "club_name"] = s_seriea_fixed

s_bundesliga.loc[s_bundesliga_idx2, "club_involved_name"] = s_bundesliga_fixed2
s_champ.loc[s_champ_idx2, "club_involved_name"] = s_champ_fixed2
s_eredivisie.loc[s_eredivisie_idx2, "club_involved_name"] = s_eredivisie_fixed2
s_liganos.loc[s_liganos_idx2, "club_involved_name"] = s_liganos_fixed2
s_ligue1.loc[s_ligue1_idx2, "club_involved_name"] = s_ligue1_fixed2
s_premierleague.loc[s_premierleague_idx2, "club_involved_name"] = s_premierleague_fixed2
s_premierliga.loc[s_premierliga_idx2, "club_involved_name"] = s_premierliga_fixed2
s_primeradiv.loc[s_primeradiv_idx2, "club_involved_name"] = s_primeradiv_fixed2
s_seriea.loc[s_seriea_idx2, "club_involved_name"] = s_seriea_fixed2

"""### Remove Unpaired Entities
In some cases, you may want to exclude entities that only appear in one dataset or the other from your database. Let's suppose that's the case here and remove all countries that only appear in one dataset or the other.

As before, we first extract the full list of clubs found in both datasets and convert the lists to sets.
"""

bundsliga_names = s_bundesliga["club_name"].unique()
champ_names = s_champ["club_name"].unique()
eredivisie_names = s_eredivisie["club_name"].unique()
liganos_names = s_liganos["club_name"].unique()
ligue1_names = s_ligue1["club_name"].unique()
premierleague_names = s_premierleague["club_name"].unique()
premierliga_names = s_premierliga["club_name"].unique()
primeradiv_names = s_primeradiv["club_name"].unique()
seria_names = s_seriea["club_name"].unique()

bundsliga_names2 = s_bundesliga["club_involved_name"].unique()
champ_names2 = s_champ["club_involved_name"].unique()
eredivisie_names2 = s_eredivisie["club_involved_name"].unique()
liganos_names2 = s_liganos["club_involved_name"].unique()
ligue1_names2 = s_ligue1["club_involved_name"].unique()
premierleague_names2 = s_premierleague["club_involved_name"].unique()
premierliga_names2 = s_premierliga["club_involved_name"].unique()
primeradiv_names2 = s_primeradiv["club_involved_name"].unique()
seria_names2 = s_seriea["club_involved_name"].unique()

s_names = set(bundsliga_names.tolist() + champ_names.tolist() + eredivisie_names.tolist() + liganos_names.tolist() + ligue1_names.tolist() + premierleague_names.tolist() + premierliga_names.tolist() + primeradiv_names.tolist() + seria_names.tolist() + bundsliga_names2.tolist() + champ_names2.tolist() + eredivisie_names2.tolist() + liganos_names2.tolist() + ligue1_names2.tolist() + premierleague_names2.tolist() + premierliga_names2.tolist() + primeradiv_names2.tolist() + seria_names2.tolist())

t_names = set(t_clubs["name"].unique().tolist())

"""Then, we convert these lists to sets and use set-difference operations to find the clubs that appear in transfers dataset but not in the transfermarkt dataset."""

total_diff = s_names.difference(t_names)
total_diff

"""Finally, we drop all rows from the transfers dataset that doesn't have any corresponding general information."""

s_bundesliga.drop(s_bundesliga[s_bundesliga['club_name'].isin(total_diff)].index, inplace=True)
s_champ.drop(s_champ[s_champ['club_name'].isin(total_diff)].index, inplace=True)
s_eredivisie.drop(s_eredivisie[s_eredivisie['club_name'].isin(total_diff)].index, inplace=True)
s_liganos.drop(s_liganos[s_liganos['club_name'].isin(total_diff)].index, inplace=True)
s_ligue1.drop(s_ligue1[s_ligue1['club_name'].isin(total_diff)].index, inplace=True)
s_premierleague.drop(s_premierleague[s_premierleague['club_name'].isin(total_diff)].index, inplace=True)
s_premierliga.drop(s_premierliga[s_premierliga['club_name'].isin(total_diff)].index, inplace=True)
s_primeradiv.drop(s_primeradiv[s_primeradiv['club_name'].isin(total_diff)].index, inplace=True)
s_seriea.drop(s_seriea[s_seriea['club_name'].isin(total_diff)].index, inplace=True)

s_bundesliga.drop(s_bundesliga[s_bundesliga['club_involved_name'].isin(total_diff)].index, inplace=True)
s_champ.drop(s_champ[s_champ['club_involved_name'].isin(total_diff)].index, inplace=True)
s_eredivisie.drop(s_eredivisie[s_eredivisie['club_involved_name'].isin(total_diff)].index, inplace=True)
s_liganos.drop(s_liganos[s_liganos['club_involved_name'].isin(total_diff)].index, inplace=True)
s_ligue1.drop(s_ligue1[s_ligue1['club_involved_name'].isin(total_diff)].index, inplace=True)
s_premierleague.drop(s_premierleague[s_premierleague['club_involved_name'].isin(total_diff)].index, inplace=True)
s_premierliga.drop(s_premierliga[s_premierliga['club_involved_name'].isin(total_diff)].index, inplace=True)
s_primeradiv.drop(s_primeradiv[s_primeradiv['club_involved_name'].isin(total_diff)].index, inplace=True)
s_seriea.drop(s_seriea[s_seriea['club_involved_name'].isin(total_diff)].index, inplace=True)

"""## Replace Categorical Variables with Indicators

Use the club_id from the transfermarkt dataset to replace the club names in the transfers dataset
"""

name_codes = t_clubs.set_index('name')['club_id']
name_codes

"""Next, we use this `Series` to map all clubs in both datasets to the corresponding integers by indexing the `Series` with the names of the club in the datasets."""

s_bundesliga["club_name"] = name_codes.loc[s_bundesliga["club_name"]].values
s_champ["club_name"] = name_codes.loc[s_champ["club_name"]].values
s_eredivisie["club_name"] = name_codes.loc[s_eredivisie["club_name"]].values
s_liganos["club_name"] = name_codes.loc[s_liganos["club_name"]].values
s_ligue1["club_name"] = name_codes.loc[s_ligue1["club_name"]].values
s_premierleague["club_name"] = name_codes.loc[s_premierleague["club_name"]].values
s_premierliga["club_name"] = name_codes.loc[s_premierliga["club_name"]].values
s_primeradiv["club_name"] = name_codes.loc[s_primeradiv["club_name"]].values
s_seriea["club_name"] = name_codes.loc[s_seriea["club_name"]].values

s_bundesliga["club_involved_name"] = name_codes.loc[s_bundesliga["club_involved_name"]].values
s_champ["club_involved_name"] = name_codes.loc[s_champ["club_involved_name"]].values
s_eredivisie["club_involved_name"] = name_codes.loc[s_eredivisie["club_involved_name"]].values
s_liganos["club_involved_name"] = name_codes.loc[s_liganos["club_involved_name"]].values
s_ligue1["club_involved_name"] = name_codes.loc[s_ligue1["club_involved_name"]].values
s_premierleague["club_involved_name"] = name_codes.loc[s_premierleague["club_involved_name"]].values
s_premierliga["club_involved_name"] = name_codes.loc[s_premierliga["club_involved_name"]].values
s_primeradiv["club_involved_name"] = name_codes.loc[s_primeradiv["club_involved_name"]].values
s_seriea["club_involved_name"] = name_codes.loc[s_seriea["club_involved_name"]].values

"""Finally, we convert the columns to integer types."""

s_bundesliga["club_name"] = s_bundesliga["club_name"].astype(np.int64)
s_champ["club_name"] = s_champ["club_name"].astype(np.int64)
s_eredivisie["club_name"] = s_eredivisie["club_name"].astype(np.int64)
s_liganos["club_name"] = s_liganos["club_name"].astype(np.int64)
s_ligue1["club_name"] = s_ligue1["club_name"].astype(np.int64)
s_premierleague["club_name"] = s_premierleague["club_name"].astype(np.int64)
s_premierliga["club_name"] = s_premierliga["club_name"].astype(np.int64)
s_primeradiv["club_name"] = s_primeradiv["club_name"].astype(np.int64)
s_seriea["club_name"] = s_seriea["club_name"].astype(np.int64)

s_bundesliga["club_involved_name"] = s_bundesliga["club_involved_name"].astype(np.int64)
s_champ["club_involved_name"] = s_champ["club_involved_name"].astype(np.int64)
s_eredivisie["club_involved_name"] = s_eredivisie["club_involved_name"].astype(np.int64)
s_liganos["club_involved_name"] = s_liganos["club_involved_name"].astype(np.int64)
s_ligue1["club_involved_name"] = s_ligue1["club_involved_name"].astype(np.int64)
s_premierleague["club_involved_name"] = s_premierleague["club_involved_name"].astype(np.int64)
s_premierliga["club_involved_name"] = s_premierliga["club_involved_name"].astype(np.int64)
s_primeradiv["club_involved_name"] = s_primeradiv["club_involved_name"].astype(np.int64)
s_seriea["club_involved_name"] = s_seriea["club_involved_name"].astype(np.int64)


dfs = [
    s_bundesliga, s_champ, s_eredivisie, s_liganos,
    s_ligue1, s_premierleague, s_premierliga, s_primeradiv, s_seriea
]

combined_df = pd.concat(dfs, ignore_index=True)

combined_df.to_csv('/content/drive/My Drive/trades_data/transfers.csv', index=False)

"""## Find an Index

Before ingesting our data into the database, we need to find a unique index for each table

### Single-Column Index
"""

len(t_clubs["club_id"].unique()) == len(t_clubs["club_id"])

"""## Export Data
After cleaning our datasets, resolving entity resolution problems, and choosing indices, we're ready to ingest our the data into our database.

In the past, students have found using Python for data ingestion slow and frustrating, so we won't populate the database here. Instead, we'll export both datasets and the country codes to CSVs. Then, we'll show you how to ingest these CSVs into your database using MySQL Workbench in the tutorial on data ingestion.

First, convert the `Series` of country codes to an equivalent `DataFrame`
"""

name_codes = pd.DataFrame(data={'name': name_codes.index, 'code': name_codes.values}) # we do not need to make a new file because it's in t_clubs

"""Next, we use `DataFrame.to_csv` to write each dataset to a CSV file with a descriptive name.

*For `le` and `country_codes`, we set `index` to `False` because the indices of the `DataFrames` are meaningless integers that we don't need in our tables. For `census`, we rename the index and include it in the output because we decided  to use it as our table index, even though it's arbitrary.*
"""

t_clubs.to_csv("t_clubs.csv", index=False)
t_players.to_csv("t_players.csv", index=False)
t_appearances.to_csv("t_appearances.csv", index=False)
t_clubgames.to_csv("t_clubgames.csv", index=False)
t_comps.to_csv("t_comps.csv", index=False)
t_events.to_csv("t_events.csv", index=False)
t_games.to_csv("t_games.csv", index=False)
t_playerval.to_csv("t_playerval.csv", index=False)

'''
s_bundesliga.to_csv("s_bundesliga.csv", index=False)
s_champ.to_csv("s_champ.csv", index=False)
s_eredivisie.to_csv("s_eredivisie.csv", index=False)
s_liganos.to_csv("s_liganos.csv", index=False)
s_ligue1.to_csv("s_ligue1.csv", index=False)
s_premierleague.to_csv("s_premierleague.csv", index=False)
s_premierliga.to_csv("s_premierliga.csv", index=False)
s_primeradiv.to_csv("s_primeradiv.csv", index=False)
s_seriea.to_csv("s_seriea.csv", index=False)
'''

dfs = [
    s_bundesliga, s_champ, s_eredivisie, s_liganos,
    s_ligue1, s_premierleague, s_premierliga, s_primeradiv, s_seriea
]

combined_df = pd.concat(dfs, ignore_index=True)

combined_df.to_csv('transfers.csv', index=False)

"""Finally, we download these files to our local machine, so we can put them into MySQL Workbench later."""

from google.colab import files
files.download("t_clubs.csv")
files.download("t_players.csv")
files.download("t_appearances.csv")
files.download("t_clubgames.csv")
files.download("t_comps.csv")
files.download("t_events.csv")
files.download("t_games.csv")
files.download("t_playerval.csv")
files.download("transfers.csv")

'''
files.download("s_bundesliga.csv")
files.download("s_champ.csv")
files.download("s_eredivisie.csv")
files.download("s_liganos.csv")
files.download("s_ligue1.csv")
files.download("s_premierleague.csv")
files.download("s_premierliga.csv")
files.download("s_primeradiv.csv")
files.download("s_seriea.csv")
files.download("s_seriea.csv")
'''