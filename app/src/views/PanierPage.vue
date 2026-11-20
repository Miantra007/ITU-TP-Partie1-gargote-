<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Panier</ion-title>
        <ion-buttons slot="end" @click.stop.prevent="vider()">Vider</ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-buttons v-if="nombreArticles == 0" :router-link="`/tabs/menu`">Voir le menu</ion-buttons>
      <ion-list v-else="nombreArticles > 0">
        <ion-item v-for="l in lignes">
          <ion-label>
            <h2>{{ l.plat.nom }}</h2>
            <p>{{ Number(l.plat.prix) * l.quantite }}</p>
          </ion-label>
          <ion-button fill="clear" @click.stop.prevent="changerQuantite(l.plat.id, -1)">
            <ion-icon slot="icon-only" :icon="removeCircleOutline" />
          </ion-button>
          <p>{{ l.quantite }}</p>
          <ion-button fill="clear" @click.stop.prevent="changerQuantite(l.plat.id, 1)">
            <ion-icon slot="icon-only" :icon="addCircleOutline" />
          </ion-button>
        </ion-item>
      </ion-list>
      <h1>Total : {{ total }}</h1>
      <ion-input v-model="table" type="number" label="Numéro de table" label-placement="floating" fill="outline"
        :class="{ 'ion-invalid ion-touched': erreurTable }" :error-text="erreurTable" />
      <ion-button expand="block" class="ion-margin-top" :disabled="envoi" @click="confirmer">
        Envoyer la commande
      </ion-button>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonInput, toastController, IonLabel, alertController, IonButton, useIonRouter, IonIcon, IonButtons, IonList, IonItem, IonToolbar, IonTitle, IonContent, IonText, loadingController } from '@ionic/vue';
import { usePanier } from '@/composables/usePanier';
import { removeCircleOutline, addCircleOutline, tabletLandscape, library } from 'ionicons/icons';
import { ref } from 'vue';
import { formatAriary } from '@/utils/format';
import api from '@/services/api';
import { ErreurApi } from '@/services/api';
import type { LigneCommande, NouvelleCommande } from '@/types/gargote';

const { lignes, nombreArticles, changerQuantite, total, vider } = usePanier();
const table = ref('');
const erreurTable = ref('');
const envoi = ref(false);
const ionRouter = useIonRouter();


async function afficherToast(message: string, color: string) {
  const toast = await toastController.create({
    message: message,
    color: color,
    duration: 1500, position: 'top',
  });
  await toast.present();
}

async function envoyer() {

  envoi.value = true;
  erreurTable.value = '';
  let succes = false;
  let commandeCree;
  let loading;

  try {
    loading = await loadingController.create({
      message: `Envoi de la commande`,
      spinner: `circular`
    });
    await loading.present();

    const ligneCommande: LigneCommande[] = lignes.value.map(l => ({
      plat_id: l.plat.id,
      nom: l.plat.nom,
      quantite: l.quantite,
      prix_unitaire: l.plat.prix,
      sous_total: l.plat.prix
    }));

    const commande: NouvelleCommande = {
      table: Number(table.value),
      lignes: ligneCommande
    };

    const resultat = await api.creerCommande(commande);
    commandeCree = resultat;
    succes = true;

  } catch (e) {
    if (e instanceof ErreurApi && e.statut == 422 && e.details.table) {
      erreurTable.value = e.details.table;
    }
    else {
      if (e instanceof ErreurApi) {
        await afficherToast(e.message, 'danger');
      }
    }

  } finally {
    if (loading) {
      await loading.dismiss();
    }
    envoi.value = false;
  }

  if (succes) {
    vider();
    table.value = '';
    await afficherToast(`Commande n°${commandeCree?.id} envoyee`, 'success');
    ionRouter.navigate('/tabs/commandes', 'forward', 'replace');
  }

}

async function confirmer() {
  const alerte = await alertController.create({
    header: 'Confirmer la commande',
    message: `Table ${table.value} : ${formatAriary(total.value)}`,
    buttons: [
      { text: 'Annuler', role: 'cancel' },
      { text: 'Envoyer', role: 'confirm' },
    ],
  });

  await alerte.present();

  const { role } = await alerte.onDidDismiss();

  if (role === 'confirm') {
    await envoyer();
  }
}
</script>
