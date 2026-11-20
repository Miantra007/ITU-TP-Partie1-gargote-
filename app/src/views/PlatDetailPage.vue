<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-buttons slot="start">
                    <ion-back-button default-href="/tabs/menu" text="Menu" />
                </ion-buttons>

                <ion-title>Detail du plat n° {{ id }}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <div v-if="chargement" class="ion-text-center ion-padding">
                <ion-spinner />
                <p>Chargement du plat...</p>
            </div>

            <ion-text v-else-if="erreur" color="danger">
                <p>{{ erreur }}</p>
            </ion-text>

            <ion-card v-else-if="plat">
                <ion-card-header>
                    <ion-card-subtitle>
                        {{ plat.categorie.nom }}
                    </ion-card-subtitle>

                    <ion-card-title>
                        {{ plat.nom }}
                    </ion-card-title>
                </ion-card-header>

                <ion-card-content>
                    <p>{{ plat.description }}</p>

                    <p>
                        Prix : {{ plat.prix }}
                    </p>

                    <p v-if="!plat.disponible">
                        Ce plat est épuisé.
                    </p>
                </ion-card-content>
                <ion-button expand="block" :disabled="!plat.disponible"
                    @click.stop.prevent="ajouterAuPanier(plat)">Ajouter au
                    panier</ion-button>
            </ion-card>
        </ion-content>

    </ion-page>

</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonButton, IonButtons, IonCardSubtitle, IonSpinner, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonToolbar, IonTitle, IonContent, IonText, IonBackButton, useIonRouter } from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';
import { ErreurApi } from '@/services/api';
import { usePanier } from '@/composables/usePanier';
import type { Plat } from '@/types/gargote';


const ionRouter = useIonRouter();
const { ajouter, lignes } = usePanier();
const route = useRoute();
const id = route.params.id;

const plat = ref<Plat | null>();
const chargement = ref(true);
const erreur = ref<string | null>(null);


onMounted(async () => {
    chargement.value = true;
    try {
        plat.value = await api.getPlatsDetails(Number(id))
    } catch (e) {
        if (e instanceof ErreurApi && e.statut === 404) {
            erreur.value = "Ce plat n'existe pas.";
        } else {
            erreur.value = "Impossible de charger le plat.";
        }
    } finally {
        chargement.value = false;
    }
});

async function ajouterAuPanier(plat: Plat) {
    await ajouter(plat);
    ionRouter.back();
}


</script>
