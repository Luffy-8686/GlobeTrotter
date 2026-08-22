# -*- coding: utf-8 -*-
from odoo import models, fields, api


class GtActivity(models.Model):
    _name = 'gt.activity'
    _description = 'GlobeTrotter Activity'
    _order = 'name asc'

    name = fields.Char(string='Activity Name', required=True, index=True)
    category = fields.Selection([
        ('sightseeing', 'Sightseeing'),
        ('food', 'Food & Dining'),
        ('adventure', 'Adventure'),
        ('culture', 'Culture & History'),
        ('shopping', 'Shopping'),
        ('nightlife', 'Nightlife'),
        ('nature', 'Nature & Outdoors'),
        ('wellness', 'Wellness & Spa'),
    ], string='Category', required=True, index=True)
    description = fields.Text(string='Description')
    estimated_cost = fields.Float(string='Estimated Cost', digits=(10, 2), default=0.0)
    duration_hours = fields.Float(string='Duration (Hours)', default=2.0)
    city_id = fields.Many2one(
        'gt.city',
        string='City',
        required=True,
        ondelete='cascade',
        index=True,
    )
    image = fields.Image(string='Activity Image', max_width=1024, max_height=1024)
    image_url = fields.Char(string='Image URL', help='External URL for activity image')

    # Related fields for convenience
    city_name = fields.Char(related='city_id.name', string='City Name', store=True)
    city_country = fields.Char(related='city_id.country', string='Country', store=True)

    _sql_constraints = [
        ('check_cost_positive', 'CHECK(estimated_cost >= 0)',
         'Estimated cost cannot be negative!'),
        ('check_duration_positive', 'CHECK(duration_hours > 0)',
         'Duration must be greater than zero!'),
    ]

    def name_get(self):
        result = []
        for activity in self:
            result.append((activity.id, f"{activity.name} ({activity.city_name})"))
        return result

    @api.model
    def _name_search(self, name, domain=None, operator='ilike', limit=None, order=None):
        """Allow searching by activity name, category, or city."""
        domain = domain or []
        if name:
            domain = [
                '|', '|',
                ('name', operator, name),
                ('category', operator, name),
                ('city_name', operator, name),
            ] + domain
        return self._search(domain, limit=limit, order=order)
