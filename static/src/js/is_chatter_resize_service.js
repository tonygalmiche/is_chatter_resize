import { registry } from "@web/core/registry";

/**
 * Charge au démarrage tous les réglages du chatter de l'utilisateur
 * (pas d'appel serveur à l'ouverture de chaque formulaire, pas de flash).
 *
 * Recherche d'un réglage : celui de la vue, sinon le dernier réglage
 * enregistré pour le même modèle, sinon null (affichage standard).
 */
const isChatterResizeService = {
    dependencies: ["orm"],

    async start(env, { orm }) {
        const parVue = {};
        const parModele = {};
        try {
            // Du plus récent au plus ancien : le premier trouvé par modèle est le dernier enregistré
            const preferences = await orm.call("is.chatter.resize", "get_preferences", []);
            for (const pref of preferences) {
                const reglage = { largeur: pref.largeur, masque: pref.masque };
                if (pref.view_id && !(pref.view_id in parVue)) {
                    parVue[pref.view_id] = reglage;
                }
                if (!(pref.model in parModele)) {
                    parModele[pref.model] = reglage;
                }
            }
        } catch (error) {
            console.warn("[is_chatter_resize] Erreur au chargement des réglages :", error);
        }

        return {
            get(model, viewId) {
                if (viewId && parVue[viewId]) {
                    return { ...parVue[viewId] };
                }
                if (parModele[model]) {
                    return { ...parModele[model] };
                }
                return null;
            },

            async set(model, viewId, reglage) {
                const valeur = { largeur: reglage.largeur || 0, masque: !!reglage.masque };
                if (viewId) {
                    parVue[viewId] = valeur;
                }
                parModele[model] = valeur;
                try {
                    await orm.silent.call("is.chatter.resize", "set_preference", [
                        model,
                        viewId || false,
                        valeur.largeur,
                        valeur.masque,
                    ]);
                } catch (error) {
                    console.warn("[is_chatter_resize] Erreur à l'enregistrement :", error);
                }
            },
        };
    },
};

registry.category("services").add("is_chatter_resize", isChatterResizeService);
