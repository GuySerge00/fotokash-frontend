export const fcfa = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
export const formatSize = (b) => b < 1048576 ? (b / 1024).toFixed(1) + " Ko" : (b / 1048576).toFixed(1) + " Mo";
