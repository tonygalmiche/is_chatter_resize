# InfoSaône - Redimensionner ou masquer le chatter des formulaires

Module Odoo 18 pour redimensionner ou masquer le chatter (messages, activités, pièces jointes) des formulaires, avec un réglage mémorisé automatiquement par utilisateur et par formulaire.

## Fonctionnalités

- **Masquer / afficher** : bouton avec l'icône de discussion à droite de la barre du haut (à côté des flèches de navigation), dans tous les formulaires qui ont un chatter. Fonctionne que le chatter soit à droite ou en bas.
- **Redimensionner** : quand le chatter est à droite, tirer son bord gauche (le curseur devient une double flèche). Largeur minimale 250 px ; le formulaire garde au moins 500 px.
- **Revenir à la largeur standard** : double-clic sur le bord gauche du chatter.
- Rien dans les fenêtres (dialogues) ni sur smartphone.

## Mémorisation

Automatique, sans option :

- quand l'utilisateur change la largeur ou masque le chatter, le réglage est enregistré pour la vue uniquement (modèle `is.chatter.resize` : utilisateur, modèle, vue, largeur, masqué) ;
- à l'ouverture d'un formulaire : réglage de cette vue, sinon dernier réglage enregistré pour le même modèle (toutes vues confondues), sinon affichage standard d'Odoo ;
- tous les réglages de l'utilisateur sont chargés au démarrage (pas d'appel serveur à l'ouverture d'un formulaire) ;
- chaque utilisateur ne voit que ses propres réglages (règle d'accès).

## Technique

- `static/src/js/is_chatter_resize_service.js` : service qui charge les réglages et les enregistre.
- `static/src/js/is_chatter_resize.js` : patch du `FormController`. Le réglage est posé sur l'élément racine du formulaire (`data-is-chatter-masque`, `data-is-chatter-largeur`, variable CSS `--is-chatter-largeur`) et non sur le chatter, qu'Odoo recrée quand la fenêtre change de taille ou qu'on change d'enregistrement.
- `static/src/scss/is_chatter_resize.scss` : masquage, largeur et poignée (`::before` sur `.o-mail-Form-chatter.o-aside`).
- `static/src/xml/is_chatter_resize.xml` : bouton dans le slot `control-panel-navigation-additional` de `web.FormView`.

## Dépendances

- `base`
- `web`
- `mail`

## Auteur

**InfoSaône / Tony Galmiche**
http://www.infosaone.com

## Licence

AGPL-3
