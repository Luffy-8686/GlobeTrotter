# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError


class GtStop(models.Model):
    _name = 'gt.stop'
    _description = 'GlobeTrotter Trip Stop'
    _order = 'sequence asc, arrival_date asc'

    trip_id = fields.Many2one(
        'gt.trip',
        string='Trip',
        required=True,
        ondelete='cascade',
        index=True,
    )
    city_id = fields.Many2one(
        'gt.city',
        string='City',
        required=True,
        ondelete='restrict',
        index=True,
    )
    sequence = fields.Integer(string='Sequence', default=10)
    arrival_date = fields.Date(string='Arrival Date')
    departure_date = fields.Date(string='Departure Date')
    notes = fields.Text(string='Notes')

    # One2many to activities assigned to this stop
    stop_activity_ids = fields.One2many(
        'gt.stop.activity',
        'stop_id',
        string='Activities',
    )

    # Computed fields
    duration_days = fields.Integer(
        string='Duration (Days)',
        compute='_compute_duration_days',
        store=True,
    )
    stop_budget = fields.Float(
        string='Stop Budget',
        compute='_compute_stop_budget',
        store=True,
        digits=(12, 2),
    )
    activity_count = fields.Integer(
        string='Activities',
        compute='_compute_activity_count',
        store=True,
    )

    # Related fields
    city_name = fields.Char(related='city_id.name', string='City Name', store=True)
    city_country = fields.Char(related='city_id.country', string='Country', store=True)
    city_image = fields.Image(related='city_id.image', string='City Image')
    trip_start_date = fields.Date(related='trip_id.start_date', string='Trip Start')
    trip_end_date = fields.Date(related='trip_id.end_date', string='Trip End')

    # -------------------------------------------------------------------------
    # Constraints
    # -------------------------------------------------------------------------
    @api.constrains('arrival_date', 'departure_date')
    def _check_stop_dates(self):
        for stop in self:
            if stop.arrival_date and stop.departure_date:
                if stop.departure_date < stop.arrival_date:
                    raise ValidationError(
                        f"Departure date must be on or after arrival date for stop in {stop.city_name}."
                    )

    @api.constrains('arrival_date', 'departure_date', 'trip_id')
    def _check_dates_within_trip(self):
        for stop in self:
            if stop.arrival_date and stop.trip_id.start_date:
                if stop.arrival_date < stop.trip_id.start_date:
                    raise ValidationError(
                        f"Stop arrival date ({stop.arrival_date}) cannot be before "
                        f"trip start date ({stop.trip_id.start_date})."
                    )
            if stop.departure_date and stop.trip_id.end_date:
                if stop.departure_date > stop.trip_id.end_date:
                    raise ValidationError(
                        f"Stop departure date ({stop.departure_date}) cannot be after "
                        f"trip end date ({stop.trip_id.end_date})."
                    )

    # -------------------------------------------------------------------------
    # Computed Fields
    # -------------------------------------------------------------------------
    @api.depends('arrival_date', 'departure_date')
    def _compute_duration_days(self):
        for stop in self:
            if stop.arrival_date and stop.departure_date:
                stop.duration_days = (stop.departure_date - stop.arrival_date).days + 1
            else:
                stop.duration_days = 0

    @api.depends('stop_activity_ids.final_cost')
    def _compute_stop_budget(self):
        for stop in self:
            stop.stop_budget = sum(stop.stop_activity_ids.mapped('final_cost'))

    @api.depends('stop_activity_ids')
    def _compute_activity_count(self):
        for stop in self:
            stop.activity_count = len(stop.stop_activity_ids)

    def name_get(self):
        result = []
        for stop in self:
            name = f"{stop.city_name or 'Unknown'}"
            if stop.arrival_date and stop.departure_date:
                name += f" ({stop.arrival_date} → {stop.departure_date})"
            result.append((stop.id, name))
        return result
