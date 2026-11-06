# -*- coding: utf-8 -*-
{
    "name": "InfoSaône - Redimensionner ou masquer le chatter des formulaires",
    "version": "20.0.1.0.0",
    "author": "InfoSaône / Tony Galmiche",
    "category": "InfoSaône",
    "summary": "Redimensionner ou masquer le chatter, réglage mémorisé par utilisateur et par formulaire",
    "description": """
        Ce module permet, dans les formulaires qui ont un chatter :
        - de le redimensionner avec une poignée sur son bord gauche (chatter à droite) ;
        - de le masquer ou de l'afficher avec un bouton dans la barre du haut.

        Le réglage est mémorisé automatiquement par utilisateur et par vue.
        À l'ouverture d'un formulaire : réglage de la vue, sinon dernier réglage
        du même modèle, sinon affichage standard d'Odoo.
    """,
    "maintainer": "InfoSaône",
    "website": "http://www.infosaone.com",
    "depends": [
        "base",
        "web",
        "mail",
    ],
    "data": [
        "security/ir.access.csv",
    ],
    "assets": {
        "web.assets_backend": [
            "is_chatter_resize/static/src/js/is_chatter_resize_service.js",
            "is_chatter_resize/static/src/js/is_chatter_resize.js",
            "is_chatter_resize/static/src/xml/is_chatter_resize.xml",
            "is_chatter_resize/static/src/scss/is_chatter_resize.scss",
        ],
    },
    "installable": True,
    "auto_install": False,
    "application": False,
    "license": "AGPL-3",
}
