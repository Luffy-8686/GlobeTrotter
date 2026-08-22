# -*- coding: utf-8 -*-
from odoo import models, fields


class ResUsers(models.Model):
    _inherit = 'res.users'

    # GlobeTrotter-specific fields
    saved_destination_ids = fields.Many2many(
        'gt.city',
        'gt_user_saved_destinations_rel',
        'user_id',
        'city_id',
        string='Saved Destinations',
    )
    travel_preferences = fields.Char(
        string='Travel Preferences',
        help='Comma-separated travel preference tags (e.g., adventure, culture, food)',
    )
    bio = fields.Text(string='Bio')

    # Reverse relation to trips
    gt_trip_ids = fields.One2many('gt.trip', 'user_id', string='My Trips')
    gt_trip_count = fields.Integer(string='Trip Count', compute='_compute_trip_count')

    def _compute_trip_count(self):
        for user in self:
            user.gt_trip_count = self.env['gt.trip'].search_count([('user_id', '=', user.id)])
