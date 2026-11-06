# -*- coding: utf-8 -*-

from odoo import api, fields, models


class IsChatterResize(models.Model):
    _name = "is.chatter.resize"
    _description = "Réglage du chatter par utilisateur et par vue"
    _order = "write_date desc, id desc"
    _rec_name = "model"

    user_id = fields.Many2one(
        "res.users", string="Utilisateur", required=True, ondelete="cascade", index=True
    )
    model = fields.Char(string="Modèle", required=True, index=True)
    view_id = fields.Many2one("ir.ui.view", string="Vue", ondelete="cascade", index=True)
    largeur = fields.Integer(
        string="Largeur (px)", default=0, help="0 = largeur standard d'Odoo"
    )
    masque = fields.Boolean(string="Masqué", default=False)

    @api.model
    def get_preferences(self):
        """Réglages de l'utilisateur courant, du plus récent au plus ancien"""
        records = self.search([("user_id", "=", self.env.uid)])
        return [
            {
                "model": r.model,
                "view_id": r.view_id.id or False,
                "largeur": r.largeur,
                "masque": r.masque,
            }
            for r in records
        ]

    @api.model
    def set_preference(self, model, view_id, largeur, masque):
        """Enregistre le réglage de l'utilisateur courant pour cette vue"""
        view_id = int(view_id) if view_id else False
        if view_id and not self.env["ir.ui.view"].sudo().browse(view_id).exists():
            view_id = False
        vals = {
            "largeur": max(int(largeur or 0), 0),
            "masque": bool(masque),
        }
        record = self.search(
            [
                ("user_id", "=", self.env.uid),
                ("model", "=", model),
                ("view_id", "=", view_id),
            ],
            limit=1,
        )
        if record:
            record.write(vals)
        else:
            vals.update({"user_id": self.env.uid, "model": model, "view_id": view_id})
            self.create(vals)
        return True
