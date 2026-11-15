import pandas as pd
import sys
sys.stdout.reconfigure(encoding="utf-8") #pour que les accents sois écrit

df = pd.read_csv("data/budget-participatif_operations-projets-gagnants-realisations.csv", sep=";")

print(df.shape)
print(df.columns)

"""pre: le dataset initiale
   post: supprimer colonne vide, doublons, colonne inutile et renommer le reste
"""
colonnes_vides =  []
for colonne in df.columns:
    if df[colonne].isna().all():
        colonnes_vides.append(colonne)
print(colonnes_vides)

df = df.drop(columns=colonnes_vides) #supprimer colonne vide
df = df.drop(columns=["geo_shape", "geo_point_2d"]) #supprimer doublon
print(df.shape)

inutiles = ["Titre de l'opération",
    "Adresse de l'opération",
    "Adresse du projet lauréat",
    "Lien URL vers le projet soumis au vote",
    "Lien URL vers le projet lauréat",
    "Direction pilote de l'opération",
    "Arrondissement du projet lauréat",
    "Avancement du projet",
    "Opération en Quartier Populaire",
    "Projet en Quartier populaire",
    "Quartier de l'opération",
    "Date de début des études du projet",
    "Date de lancement des procédures du projet",
    "Date de lancement des travaux du projet",
    "Date prévisonnelle de livraison du projet",
    "Date d'ouverture du projet au public",]

df = df.drop(columns=inutiles) #supprimer ce qu'on utilisera pas
print(df.shape)

df = df.rename(columns={"Identifiant de l'opération": "id_operation",
    "Identifiant du projet lauréat": "id_projet",
    "Titre du projet lauréat": "titre_projet",
    "Edition": "edition",
    "Thématique": "thematique",
    "Direction pilote du projet lauréat": "direction_pilote",
    "Type de financement de l'opération": "type_financement",
    "Arrondissement de l'opération": "arrondissement",
    "Longitude": "longitude",
    "Latitude": "latitude",
    "Avancement de l'opération": "avancement",
    "Date de début des études de l'opération": "date_debut_etudes",
    "Date de lancement des procédures de l'opération": "date_procedures",
    "Date de lancement des travaux de l'opération": "date_travaux",
    "Date prévisonnelle de livraison de l'opération": "date_livraison",
    "Date d'ouverture de l'opération au public": "date_ouverture",
    "Budget global du projet lauréat": "budget_projet",
    "Echelle du Budget participatif": "echelle_budget",})

print(df.columns)

"""pre: dataset nettoyé et renommer
   post: normaliser les arrondissement, pour que UNE valeur = UN arrondissement,
         transposable dans notre carte de paris
"""

print(df["arrondissement"].value_counts()) #occurence de chaque arrondissement

def normaliser_arrondissement(arrondissement):
    arrondissement = str(arrondissement)
    if arrondissement == "75116":
        return arrondissement
    elif arrondissement.startswith("750"):
        return "751" + arrondissement[3:]
    else:
        return "EN DEHORS DE LA CARTE"

liste = []
for arrondissement in df["arrondissement"]:
    liste.append(normaliser_arrondissement(arrondissement))

df["arrondissement"] = liste
print(df["arrondissement"].value_counts().sort_index())

"""pre: les dates sont en format string
   post: faire en sorte que les dates soient
         lu comme des date par l'ordi pour pouvoir les manipuler par après.
"""

df["date_debut_etudes"] = pd.to_datetime(df["date_debut_etudes"], format="%Y-%m", errors="coerce")

print(df["date_debut_etudes"][17])

"""pre: avancement sous forme de texte
   post: avancement sous forme de valeur ordinal (0-5), si abandonné: colonne à part
"""
rangs = {"(non démarré)": 0,
    "ETUDES": 1,
    "PROCEDURES": 2,
    "TRAVAUX": 3,
    "LIVRAISON": 4,
    "FIN": 5,}

liste2 = []
for avancement in df["avancement"]:
    if avancement == "ABANDONNÉ":
        liste2.append(1)
    else:
        liste2.append(0)

df["abandon"] = liste2

df["avancement"] = df["avancement"].map(rangs)


"""pre: le budget est compté plusieurs fois pour un même projet, car c'est répété pour chaque opérations
   post: faire en sorte que le budget ne soit compté qu'une seule fois
         (voir nbre opérations par projet, et divisé budget total, par ce nbre)
"""
df["nb_operations_projet"] = df.groupby("id_projet")["id_operation"].transform("count")
print(df["nb_operations_projet"])
df["budget_par_operation"] = df["budget_projet"] / df["nb_operations_projet"]

### CREATION CSV FINALE ###
df.to_csv("data/dataset_final.csv", index=False) #index false, c'est pour retirer la colonne d'index inutile