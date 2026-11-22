import { ref, watch } from 'vue';
import { lire, ecrire } from '@/services/stockage';


export const id = ref<Number[]>([]);

export function estFavori(platId: number): boolean {
    return id.value.includes(platId);
}

function estListeFavoris(x: unknown): x is number[] {
    return Array.isArray(x) &&
        x.every(element => typeof element === 'number');
}

export async function restaurerFavoris(): Promise<void> {
    const lu = await lire("favoris", [], estListeFavoris);
    id.value = lu;
    watch(id, async () => await ecrire("favoris", id.value), { deep: true });
}

export async function basculer(platId: number): Promise<void> {
    if (estFavori(platId)) {
        id.value = id.value.filter(i => i !== platId);
    }
    else {
        id.value.push(platId);
    }
}