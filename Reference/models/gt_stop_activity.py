# -*- coding: utf-8 -*-
from odoo import models, fields, api


class GtStopActivity(models.Model):
    _name = 'gt.stop.activity'
    _description = 'GlobeTrotter Stop Activity'
    _order = 'day_index asc, sequence asc'

    stop_id = fields.Many2one(
        'gt.stop',
        string='Stop',
        required=True,
        ondelete='cascade',
        index=True,
    )
    activity_id = fields.Many2one(
        'gt.activity',
        string='Activity',
        required=True,
        ondelete='restrict',
        index=True,
    )
    day_index = fields.Integer(
        string='Day',
        default=1,
        help='Day number within this stop (1-based)',
    )
    time_slot = fields.Selection([
        ('morning', 'Morning (6AM–12PM)'),
        ('afternoon', 'Afternoon (12PM–5PM)'),
        ('evening', 'Evening (5PM–9PM)'),
        ('night', 'Night (9PM–12AM)'),
    ], string='Time Slot', default='morning')
    cost_override = fields.Float(
        string='Cost Override',
        digits=(10, 2),
        help='Override the activity default cost if different for this trip',
    )
    notes = fields.Text(string='Notes')
    sequence = fields.Integer(string='Sequence', default=10)

    # Computed fields
    final_cost = fields.Float(
        string='Final Cost',
        compute='_compute_final_cost',
        store=True,
        digits=(10, 2),
    )

    # Related fields
    activity_name = fields.Char(related='activity_id.name', string='Activity Name', store=True)
    activity_category = fields.Selection(related='activity_id.category', string='Category', store=True)
    activity_duration = fields.Float(related='activity_id.duration_hours', string='Duration (Hours)')
    activity_image = fields.Image(related='activity_id.image', string='Activity Image')
    activity_description = fields.Text(related='activity_id.description', string='Activity Description')

    # Trip reference for security rules
    trip_id = fields.Many2one(related='stop_id.trip_id', string='Trip', store=True)

    # -------------------------------------------------------------------------
    # Computed Fields
    # -------------------------------------------------------------------------
    @api.depends('cost_override', 'activity_id.estimated_cost')
    def _compute_final_cost(self):
        for rec in self:
            if rec.cost_override and rec.cost_override > 0:
                rec.final_cost = rec.cost_override
            else:
                rec.final_cost = rec.activity_id.estimated_cost if rec.activity_id else 0.0

    def name_get(self):
        result = []
        for rec in self:
            name = rec.activity_name or 'Activity'
            if rec.time_slot:
                slot_label = dict(self._fields['time_slot'].selection).get(rec.time_slot, '')
                name += f" - {slot_label}"
            result.append((rec.id, name))
        return result
