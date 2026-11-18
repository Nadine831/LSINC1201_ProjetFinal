//création d'une vue innovante: carte interactive de paris et ses arrondissements

const largeurCarte = 500;
const hauteurCarte = 400;

let arrondissementChoisi = null; //let: car variable, sert à retenir ce qu'on a cliqué

const svgCarte = d3.select("#carte").append("svg").attr("width", largeurCarte).attr("height", hauteurCarte);

// dans csv, on a pour chaque arrondissement, des données geo..., 
// => faire contours des arrondissement grâce à ses données.
// properties, cest quand on fait du survol/clic: on a + d'infos
function creationParis(arrondissements){
    const contours = [];
    for(const arrondissement of arrondissements){
        const contour = {
            type: "Feature",
            geometry: JSON.parse(arrondissement["Geometry"]),
            properties: {
                nom: arrondissement["Nom de l’arrondissement"],
                code: arrondissement["Numéro d’arrondissement INSEE"]
            }
        };
        contours.push(contour);
    }

    //featurecollection: on défini paris comme l'ensemble des arrondissements(contours)
    //et cette ensemble on va le placer dans notre svgCarte
    //pour cela, faut des conventions D3: projection mercator adapté via fitsize (remplit le svg)
    //faut aussi: geopath qui fait la traduction de paris(sa "geometry") avec projection appliqué => svg
    const paris = { type: "FeatureCollection", features: contours };
    const projection = d3.geoMercator().fitSize([largeurCarte, hauteurCarte], paris);
    const chemin = d3.geoPath().projection(projection);

    //Mise en place du dessin de paris, path ça correspond aux éléments de type feature contenu dans contours qui vont être
    //traduit en svg grâce à chemin(geoPath), (en gros cest la "geometry" de nos arrondissements, version svg)
    const formes = svgCarte.selectAll("path").data(contours).join("path").attr("class", "arrondissement").attr("d", chemin).attr("fill", "#cfe2f3").attr("stroke", "white");

    //nom arrondi au survol
    formes.append("title").text(d => d.properties.nom);

    //gestion du cliquage d'un arrondissement
    formes.on("click", (event, d) => {
        const Cliquer = d3.select(event.currentTarget);
        const resteCliquer = Cliquer.classed("choisi"); //attribution class css: "choisi"
        
        //avant choix arrondiss, en s'arrure que tout autre arrondi sois pas colorié via css
         formes.classed("choisi", false);

         if(resteCliquer){
            arrondissementChoisi = null; //le second clic, annule sélection
         }
         else{
            Cliquer.classed("choisi", true).raise();
            arrondissementChoisi = d.properties.code; //code arrondissement
         }
         console.log("choisi :", arrondissementChoisi);
});
       
}