//chargement des csv
Promise.all([d3.csv("data/dataset_final.csv"), d3.dsv(";", "data/arrondissements.csv")])
.then(([projets, arrondissements]) => {
    creationParis(arrondissements);
});;