# -*- coding: utf-8 -*-
from odoo import models, fields, api


class GtCity(models.Model):
    _name = 'gt.city'
    _description = 'GlobeTrotter City'
    _order = 'popularity_score desc, name asc'

    name = fields.Char(string='City Name', required=True, index=True)
    country = fields.Char(string='Country', required=True, index=True)
    region = fields.Selection([
        ('asia', 'Asia'),
        ('europe', 'Europe'),
        ('north_america', 'North America'),
        ('south_america', 'South America'),
        ('africa', 'Africa'),
        ('oceania', 'Oceania'),
        ('middle_east', 'Middle East'),
    ], string='Region', required=True, index=True)
    description = fields.Text(string='Description')
    cost_index = fields.Selection([
        ('1', '$'),
        ('2', '$$'),
        ('3', '$$$'),
        ('4', '$$$$'),
    ], string='Cost Index', default='2', help='Relative cost of visiting this city')
    popularity_score = fields.Integer(
        string='Popularity Score',
        default=50,
        help='Popularity score from 0 to 100',
    )
    image = fields.Image(string='City Image', max_width=1920, max_height=1080)
    image_url = fields.Char(string='Image URL', help='External URL for city image if no binary image uploaded')
    latitude = fields.Float(string='Latitude', digits=(10, 6))
    longitude = fields.Float(string='Longitude', digits=(10, 6))

    # Reverse relations
    activity_ids = fields.One2many('gt.activity', 'city_id', string='Activities')
    activity_count = fields.Integer(string='Activity Count', compute='_compute_activity_count', store=True)

    _sql_constraints = [
        ('unique_city_country', 'UNIQUE(name, country)',
         'A city with this name already exists in this country!'),
        ('check_popularity', 'CHECK(popularity_score >= 0 AND popularity_score <= 100)',
         'Popularity score must be between 0 and 100!'),
    ]

    @api.depends('activity_ids')
    def _compute_activity_count(self):
        for city in self:
            city.activity_count = len(city.activity_ids)

    def name_get(self):
        result = []
        for city in self:
            result.append((city.id, f"{city.name}, {city.country}"))
        return result

    @api.model
    def _name_search(self, name, domain=None, operator='ilike', limit=None, order=None):
        """Allow searching by city name or country."""
        domain = domain or []
        if name:
            domain = ['|', ('name', operator, name), ('country', operator, name)] + domain
        return self._search(domain, limit=limit, order=order)
