function afficherChiffres(projets) {
    const nbProjets = d3.group(projets, d => d.id_projet).size;
    const budget = d3.sum(projets, d => d.budget_par_operation);
    const tauxAbandon = d3.mean(projets, d => d.abandon) * 100;

    d3.select("#chiffre-projets").text(nbProjets.toLocaleString("fr-FR"));
    d3.select("#chiffre-budget").text(Math.round(budget / 1000000) + " M€");
    d3.select("#chiffre-abandon").text(tauxAbandon.toFixed(1).replace(".", ",") + " %");
}