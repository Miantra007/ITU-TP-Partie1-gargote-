<template>
  <!-- ion-page : l'enveloppe obligatoire de chaque page -->
  <ion-page>
    <!-- En-tête fixe en haut de l'écran -->
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Menu du jour</ion-title>
        <ion-toolbar>
          <ion-searchbar v-model="recherche" placeholder="Rechercher un plat" :debounce="250" />
        </ion-toolbar>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment v-model="categorieChoisie" scrollable @ion-change="charger">
          <ion-segment-button value="toutes"><ion-label>Tout</ion-label></ion-segment-button>
          <ion-segment-button v-for="c in categories" :key="c.id" :value="String(c.id)">
            <ion-label>{{ c.nom }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <!-- Zone qui défile -->
    <ion-content>
      <ion-refresher slot="fixed" @ion-refresh="rafraichir">
        <ion-refresher-content />
      </ion-refresher>
      <!-- 1. Chargement en cours -->
      <div v-if="chargement" class="ion-text-center ion-padding">
        <ion-spinner />
      </div>

      <!-- 2. Erreur -->
      <div v-else-if="erreur" class="ion-padding">
        <ion-text color="danger">
          <p>{{ erreur }}</p>
        </ion-text>
        <ion-button expand="block" @click="charger">Réessayer</ion-button>
      </div>

      <!-- 3. La liste des plats -->
      <ion-list v-else>
        <ion-item v-for="plat in platsFiltres" :key="plat.id" :router-link="`/tabs/menu/${plat.id}`">
          <ion-label>
            <h2>{{ plat.nom }}</h2>
            <p>{{ plat.description }}</p>
            <ion-text color="primary">{{ plat.prix }}</ion-text> <ion-badge v-if="!plat.disponible"
              color="medium">Epuise</ion-badge>
            <p>{{ plat.categorie.nom }}</p>
          </ion-label>

          <ion-button slot="end" fill="clear" :disabled="!plat.disponible" @click.stop.prevent="ajouterAuPanier(plat)">
            <ion-icon slot="icon-only" :icon="addCircleOutline" />
          </ion-button>
        </ion-item>
        <ion-item v-if="platsFiltres.length === 0">
          <ion-label class="ion-text-center">
            Aucun plat ne correspond.
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>

  </ion-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, onIonViewWillEnter, toastController, IonIcon, onIonViewDidLeave, IonLabel, IonSpinner, IonText, IonButton, IonBadge, IonSearchbar, IonRefresherContent, IonSegment, IonSegmentButton, IonRefresher
} from '@ionic/vue';
import api from '@/services/api';
import { usePanier } from '@/composables/usePanier';
import { formatAriary } from '@/utils/format';
import { addCircleOutline } from 'ionicons/icons';

const { ajouter } = usePanier();

const plats = ref([]);
const chargement = ref(true);
const erreur = ref(null);
const recherche = ref('');

const platsFiltres = computed(() => {
  return plats.value.filter((plat) =>
    plat.nom.toLowerCase().includes(recherche.value.toLowerCase())
  );
});
const categories = ref([]);
const categorieChoisie = ref('toutes');

async function charger() {
  chargement.value = true;
  erreur.value = null;
  try {
    categories.value = await api.getCategories();

    if (categorieChoisie.value === 'toutes') {
      plats.value = await api.getPlats();
    }
    else {
      plats.value = await api.getPlats(categorieChoisie.value);
    }
  } catch (e) {
    erreur.value = "Impossible de joindre l'API. Est-elle lancée ?";
    console.error(e);
  } finally {
    chargement.value = false;
  }
}
async function rafraichir(event) {
  await charger();
  event.target.complete(); // arrête l'animation
}

async function ajouterAuPanier(plat) {
  await ajouter(plat);
  const toast = await toastController.create({
    message: `${plat.nom} ajouté au panier`,
    duration: 1500, position: 'top', color: 'secondary',
  });
  await toast.present();
}

onMounted(charger);

</script>
