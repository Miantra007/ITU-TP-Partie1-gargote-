<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Commandes</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="chargerCommandes">
        <ion-refresher-content pulling-text="Tirer pour actualiser" refreshing-text="Chargement..." />
      </ion-refresher>

      <ion-text v-if="commandes.length === 0">
        <p class="ion-text-center">Aucune commande pour le moment.</p>
      </ion-text>

      <ion-list v-else>
        <ion-item v-for="c in commandes" :key="c.id">
          <ion-label class="ion-text-wrap">

            <h2>
              Commande n°{{ c.id }}
              <ion-badge>
                {{ c.statut }}
              </ion-badge>
            </h2>

            <p>Table : {{ c.table }}</p>
            <p>Date : {{ formatDate(c.date) }}</p>

            <span v-for="(l, index) in c.lignes" :key="l.plat_id">
              {{ l.quantite }} × {{ l.nom }} <span v-if="index < c.lignes.length - 1">
                ,</span></span>

            <h3>Total : {{ formatAriary(c.total) }}</h3>

          </ion-label>
        </ion-item>
      </ion-list>

    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonHeader, IonRefresher, IonList, IonItem, IonLabel, IonBadge, IonRefresherContent, IonToolbar, IonTitle, IonContent, IonText, onIonViewWillEnter, createGesture } from '@ionic/vue';
import api from '@/services/api';
import { formatAriary,formatDate } from '@/utils/format';
import { ref } from 'vue';


const commandes = ref([]);
async function chargerCommandes() {
  try {
    commandes.value = await api.getCommandes();

  } catch (e) {
    console.error('Erreur lors du chargement des commandes :', e.message);
  } finally {
    if (event) {
      await event.target.complete();
    }
  }
}
onIonViewWillEnter(chargerCommandes);

</script>
