//création d'une vue innovante: carte interactive de paris et ses arrondissements

const largeurCarte = 500;
const hauteurCarte = 400;

let arrondissementChoisi = null; //let: car variable, sert à retenir ce qu'on a cliqué

const svgCarte = d3.select("#carte").append("svg").attr("width", largeurCarte).attr("height", hauteurCarte + 70);

// dans csv, on a pour chaque arrondissement, des données geo..., 
// => faire contours des arrondissement grâce à ses données.
// properties, cest quand on fait du survol/clic: on a + d'infos
function creationParis(arrondissements, projets){

    //rollup c'est pour faire le regroupement des opérations
    const nbOperations = d3.rollup(
        projets,
        operations => operations.length,
        operation => operation.arrondissement
    );

    console.log(nbOperations);

    const couleur = d3.scaleSequential()
        .domain([0, d3.max(Array.from(nbOperations.values()))])
        .interpolator(d3.interpolateBlues);

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
    const formes = svgCarte.selectAll("path").data(contours).join("path").attr("class", "arrondissement").attr("d", chemin)
        .attr("fill", d => couleur(
            nbOperations.get(d.properties.code) || 0
        ))
        .attr("stroke", "white");

    svgCarte.selectAll(".numero-arrondissement")
        .data(contours)
        .join("text")
        .attr("class", "numero-arrondissement")
       .attr("x", d => {
            const x = chemin.centroid(d)[0];
            return d.properties.code === "75112" ? x - 50 : x;
        })
        .attr("y", d => chemin.centroid(d)[1])
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "black")
        .attr("paint-order", "stroke")
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("font-size", 12)
        .attr("font-weight", "bold")
        .attr("pointer-events", "none")
        .text(d => {
            const numero = Number(d.properties.code.slice(-2));
            return numero === 1 ? "1er" : numero + "e";
        });
    //nom arrondi au survol
    formes.append("title")
        .text(d => d.properties.nom.replace(/ardt\.?/gi, "arr.") + " : "
            + (nbOperations.get(d.properties.code) || 0)
            + " opérations");
    // Dégradé utilisé dans la légende
    const degrade = svgCarte.append("defs")
        .append("linearGradient")
        .attr("id", "degrade-carte");

    for (let i = 0; i <= 10; i++) {
        degrade.append("stop")
            .attr("offset", (i * 10) + "%")
            .attr("stop-color", d3.interpolateBlues(i / 10));
    }

    // Groupe placé sous la carte
    const legende = svgCarte.append("g")
        .attr("transform", "translate(30," + (hauteurCarte + 15) + ")");

    legende.append("text")
        .text("Nombre d’opérations")
        .attr("font-size", 12);

    legende.append("rect")
        .attr("y", 8)
        .attr("width", 220)
        .attr("height", 12)
        .attr("fill", "url(#degrade-carte)");

    const echelleLegende = d3.scaleLinear()
        .domain(couleur.domain())
        .range([0, 220]);

    legende.append("g")
        .attr("transform", "translate(0,20)")
        .call(
            d3.axisBottom(echelleLegende)
                .ticks(5)
                .tickFormat(d3.format("d"))
        );

    formes.on("mousemove", function () {
        const zone = d3.select(this);

        if (!zone.classed("au-premier-plan")) {
            formes.classed("au-premier-plan", false);
            zone.classed("au-premier-plan", true).raise();
            svgCarte.selectAll(".numero-arrondissement").raise();
        }
    });
    
    //gestion du cliquage d'un arrondissement
    formes.on("click", (event, d) => {
        event.stopPropagation();

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
         svgCarte.selectAll(".numero-arrondissement").raise();

         console.log("choisi :", arrondissementChoisi);

        
    });
       
        d3.select("body").on("click.deselectionCarte", () => {
        formes.classed("choisi", false);
        arrondissementChoisi = null;
    });
}