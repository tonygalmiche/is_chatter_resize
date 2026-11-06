import { browser } from "@web/core/browser/browser";
import { patch } from "@web/core/utils/patch";
import { useService } from "@web/core/utils/hooks";
import { FormController } from "@web/views/form/form_controller";
import { onMounted, onWillUnmount, proxy } from "@odoo/owl";

/**
 * Redimensionner ou masquer le chatter des formulaires.
 *
 * Le réglage est posé sur l'élément racine du formulaire (attributs data-* et
 * variable CSS --is-chatter-largeur), pas sur le chatter lui-même : Odoo recrée
 * le chatter quand la fenêtre change de taille ou qu'on change d'enregistrement,
 * le réglage serait alors perdu. Le CSS (is_chatter_resize.scss) fait le reste.
 */

const LARGEUR_MIN = 250; // largeur minimale du chatter (px)
const FORMULAIRE_MIN = 500; // largeur minimale laissée au formulaire (px)
const POIGNEE = 8; // largeur de la zone de saisie de la poignée (px)

patch(FormController.prototype, {
    setup() {
        super.setup(...arguments);

        this.isChatterActif =
            !this.env.inDialog &&
            !this.ui.isSmall &&
            !!this.archInfo?.xmlDoc?.querySelector("chatter");
        if (!this.isChatterActif) {
            return;
        }

        this.isChatterService = useService("is_chatter_resize");
        this.isChatterModele = this.props.resModel;
        this.isChatterVueId = this.env.config?.viewId || false;

        const reglage = this.isChatterService.get(this.isChatterModele, this.isChatterVueId);
        this.isChatterLargeur = reglage?.largeur || 0;
        this.isChatterState = proxy({ masque: !!reglage?.masque });

        this._isChatterOnPointerDown = this._isChatterOnPointerDown.bind(this);
        this._isChatterOnPointerMove = this._isChatterOnPointerMove.bind(this);
        this._isChatterOnPointerUp = this._isChatterOnPointerUp.bind(this);
        this._isChatterOnDblClick = this._isChatterOnDblClick.bind(this);

        // Owl 3 : this.rootRef est un signal.ref(), l'élément s'obtient par this.rootRef()
        onMounted(() => {
            this._isChatterAppliquer();
            this.rootRef()?.addEventListener("pointerdown", this._isChatterOnPointerDown);
            this.rootRef()?.addEventListener("dblclick", this._isChatterOnDblClick);
        });
        onWillUnmount(() => {
            this.rootRef()?.removeEventListener("pointerdown", this._isChatterOnPointerDown);
            this.rootRef()?.removeEventListener("dblclick", this._isChatterOnDblClick);
            this._isChatterFinDrag();
        });
    },

    /**
     * Renvoie le chatter si l'événement a lieu sur sa poignée (bord gauche, chatter à droite)
     */
    _isChatterSurPoignee(ev) {
        const chatter = ev.target.closest?.(".o-mail-Form-chatter.o-aside");
        // La poignée (::before) a pour cible le conteneur du chatter lui-même
        if (!chatter || chatter !== ev.target) {
            return null;
        }
        if (ev.clientX - chatter.getBoundingClientRect().left > POIGNEE) {
            return null;
        }
        return chatter;
    },

    /**
     * Pose le réglage courant sur l'élément racine du formulaire
     */
    _isChatterAppliquer() {
        const root = this.rootRef();
        if (!root) {
            return;
        }
        if (this.isChatterState.masque) {
            root.dataset.isChatterMasque = "1";
        } else {
            delete root.dataset.isChatterMasque;
        }
        if (this.isChatterLargeur > 0) {
            root.dataset.isChatterLargeur = "1";
            root.style.setProperty("--is-chatter-largeur", `${this.isChatterLargeur}px`);
        } else {
            delete root.dataset.isChatterLargeur;
            root.style.removeProperty("--is-chatter-largeur");
        }
    },

    _isChatterEnregistrer() {
        this.isChatterService.set(this.isChatterModele, this.isChatterVueId, {
            largeur: this.isChatterLargeur,
            masque: this.isChatterState.masque,
        });
    },

    /**
     * Bouton de la barre du haut : masquer / afficher le chatter
     */
    isChatterBasculer() {
        this.isChatterState.masque = !this.isChatterState.masque;
        this._isChatterAppliquer();
        this._isChatterEnregistrer();
    },

    /**
     * Début du redimensionnement : clic sur le bord gauche du chatter (à droite)
     */
    _isChatterOnPointerDown(ev) {
        if (ev.button !== 0) {
            return;
        }
        const chatter = this._isChatterSurPoignee(ev);
        if (!chatter) {
            return;
        }
        const rect = chatter.getBoundingClientRect();
        ev.preventDefault();
        ev.stopPropagation();
        this._isChatterDrag = {
            droite: rect.right,
            max: Math.max(rect.right - this.rootRef().getBoundingClientRect().left - FORMULAIRE_MIN, LARGEUR_MIN),
            largeurAvant: this.isChatterLargeur,
        };
        document.body.classList.add("is_chatter_resize_en_cours");
        browser.addEventListener("pointermove", this._isChatterOnPointerMove);
        browser.addEventListener("pointerup", this._isChatterOnPointerUp);
        browser.addEventListener("pointercancel", this._isChatterOnPointerUp);
    },

    _isChatterOnPointerMove(ev) {
        if (!this._isChatterDrag) {
            return;
        }
        const { droite, max } = this._isChatterDrag;
        const largeur = Math.round(Math.min(Math.max(droite - ev.clientX, LARGEUR_MIN), max));
        this.isChatterLargeur = largeur;
        this._isChatterAppliquer();
    },

    _isChatterOnPointerUp() {
        if (!this._isChatterDrag) {
            return;
        }
        const modifie = this.isChatterLargeur !== this._isChatterDrag.largeurAvant;
        this._isChatterFinDrag();
        if (modifie) {
            this._isChatterEnregistrer();
        }
    },

    _isChatterFinDrag() {
        this._isChatterDrag = null;
        document.body.classList.remove("is_chatter_resize_en_cours");
        browser.removeEventListener("pointermove", this._isChatterOnPointerMove);
        browser.removeEventListener("pointerup", this._isChatterOnPointerUp);
        browser.removeEventListener("pointercancel", this._isChatterOnPointerUp);
    },

    /**
     * Double-clic sur la poignée : retour à la largeur standard d'Odoo
     */
    _isChatterOnDblClick(ev) {
        if (!this._isChatterSurPoignee(ev) || !this.isChatterLargeur) {
            return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        this.isChatterLargeur = 0;
        this._isChatterAppliquer();
        this._isChatterEnregistrer();
    },
});
