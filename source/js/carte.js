//création d'une vue innovante: carte interactive de paris et ses arrondissements

const largeur = 800;
const hauteur = 600;

const svgCarte = d3.select("#carte").append("svg").attr("width", largeur).attr("height", hauteur);

// dans csv, on a pour chaque arrondissement, des données geo..., 
// => faire contours des arrondissement grâce à ses données.
function creationParis(arrondissements){
    const contours = [];
    for(const arrondissement of arrondissements){
        const contour = {
            type: "Feature",
            geometry: JSON.parse(arrondissement["Geometry"])};
        contours.push(contour);
    }

    //featurecollection: on défini paris comme l'ensemble des arrondissements(contours)
    //et cette ensemble on va le placer dans notre svgCarte de 800 x 600
    //pour cela, faut des conventions D3: projection mercator adapté via fitsize (remplit le svg)
    //faut aussi: geopath qui fait la traduction de paris(sa "geometry") avec projection appliqué => svg
    const paris = { type: "FeatureCollection", features: contours };
    const projection = d3.geoMercator().fitSize([800, 600], paris);
    const chemin = d3.geoPath().projection(projection);

    //Mise en place du dessin de paris, path ça correspond aux éléments de type feature contenu dans contours qui vont être
    //traduit en svg grâce à chemin(geoPath), (en gros cest la "geometry" de nos arrondissements, version svg)
    svgCarte.selectAll("path").data(contours).join("path").attr("d", chemin).attr("fill", "#cfe2f3").attr("stroke", "white");

}