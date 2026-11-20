import { ref, computed } from 'vue';
import type { Categorie, Commande, NouvelleCommande, LignePanier, Plat } from '@/types/gargote';

// Déclaré EN DEHORS de la fonction : un seul panier pour toute l'application

const lignes = ref<LignePanier[]>([]); // chaque ligne : { plat, quantite }
export function usePanier() {
  function ajouter(plat: Plat) {
    // TODO : si le plat est déjà dans le panier, quantite + 1,
    //        sinon ajouter une ligne { plat, quantite: 1 }
    const ligne = lignes.value.find((l) => l.plat.id === plat.id);
    if (ligne != null) {
      ligne.quantite += 1;
    } else {
      lignes.value.push({
        plat: plat,
        quantite: 1
      });
    }
  }

  function changerQuantite(platId: number, delta: number) {
    // TODO : ajoute delta (+1 ou -1) à la quantité ;
    //        si la quantité tombe à 0, retirer la ligne
    const ligne = lignes.value.find((l) => l.plat.id === platId);
    if (ligne != null) {
      ligne.quantite += delta;

      if (ligne.quantite == 0) {
        lignes.value = lignes.value.filter((l) => l.plat.id != platId);
      }
    }
  }

  function vider() {
    lignes.value = [];
  }

  const nombreArticles = computed(() =>
    lignes.value.reduce((somme, l) => somme + l.quantite, 0));

  const total = computed(() =>
    lignes.value.reduce((somme, l) => somme + Number(l.plat.prix) * l.quantite, 0)
  );

  return { lignes, ajouter, changerQuantite, vider, nombreArticles, total };
}