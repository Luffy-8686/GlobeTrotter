# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError
from datetime import date


class GtTrip(models.Model):
    _name = 'gt.trip'
    _description = 'GlobeTrotter Trip'
    _order = 'start_date desc, id desc'
    _inherit = ['mail.thread']

    name = fields.Char(string='Trip Name', required=True, tracking=True, index=True)
    description = fields.Text(string='Description')
    start_date = fields.Date(string='Start Date', required=True, tracking=True)
    end_date = fields.Date(string='End Date', required=True, tracking=True)
    cover_image = fields.Image(string='Cover Image', max_width=1920, max_height=1080)
    user_id = fields.Many2one(
        'res.users',
        string='Owner',
        default=lambda self: self.env.user,
        required=True,
        ondelete='cascade',
        index=True,
    )

    # State (auto-computed from dates)
    state = fields.Selection([
        ('draft', 'Draft'),
        ('upcoming', 'Upcoming'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
    ], string='Status', compute='_compute_state', store=True, tracking=True)

    # One2many relations
    stop_ids = fields.One2many('gt.stop', 'trip_id', string='Stops')
    expense_ids = fields.One2many('gt.expense', 'trip_id', string='Expenses')
    share_link_ids = fields.One2many('gt.share.link', 'trip_id', string='Share Links')

    # Computed fields
    total_budget = fields.Float(
        string='Total Budget',
        compute='_compute_total_budget',
        store=True,
        digits=(12, 2),
    )
    total_days = fields.Integer(string='Total Days', compute='_compute_total_days', store=True)
    destination_count = fields.Integer(
        string='Destinations',
        compute='_compute_destination_count',
        store=True,
    )
    is_shared = fields.Boolean(
        string='Is Shared',
        compute='_compute_is_shared',
        store=True,
    )
    activity_cost_total = fields.Float(
        string='Activity Costs',
        compute='_compute_total_budget',
        store=True,
        digits=(12, 2),
    )
    expense_cost_total = fields.Float(
        string='Manual Expenses',
        compute='_compute_total_budget',
        store=True,
        digits=(12, 2),
    )

    # -------------------------------------------------------------------------
    # Constraints
    # -------------------------------------------------------------------------
    @api.constrains('start_date', 'end_date')
    def _check_dates(self):
        for trip in self:
            if trip.start_date and trip.end_date and trip.end_date < trip.start_date:
                raise ValidationError(
                    "End date must be on or after the start date. "
                    f"Trip '{trip.name}': {trip.start_date} → {trip.end_date}"
                )

    _sql_constraints = [
        ('check_dates', 'CHECK(end_date >= start_date)',
         'End date must be on or after the start date!'),
    ]

    # -------------------------------------------------------------------------
    # Computed Fields
    # -------------------------------------------------------------------------
    @api.depends('start_date', 'end_date')
    def _compute_state(self):
        today = date.today()
        for trip in self:
            if not trip.start_date or not trip.end_date:
                trip.state = 'draft'
            elif today < trip.start_date:
                trip.state = 'upcoming'
            elif today > trip.end_date:
                trip.state = 'completed'
            else:
                trip.state = 'ongoing'

    @api.depends('stop_ids.stop_activity_ids.final_cost', 'expense_ids.amount')
    def _compute_total_budget(self):
        for trip in self:
            activity_total = sum(
                sa.final_cost
                for stop in trip.stop_ids
                for sa in stop.stop_activity_ids
            )
            expense_total = sum(trip.expense_ids.mapped('amount'))
            trip.activity_cost_total = activity_total
            trip.expense_cost_total = expense_total
            trip.total_budget = activity_total + expense_total

    @api.depends('start_date', 'end_date')
    def _compute_total_days(self):
        for trip in self:
            if trip.start_date and trip.end_date:
                trip.total_days = (trip.end_date - trip.start_date).days + 1
            else:
                trip.total_days = 0

    @api.depends('stop_ids')
    def _compute_destination_count(self):
        for trip in self:
            trip.destination_count = len(trip.stop_ids)

    @api.depends('share_link_ids', 'share_link_ids.is_active')
    def _compute_is_shared(self):
        for trip in self:
            trip.is_shared = any(link.is_active for link in trip.share_link_ids)

    # -------------------------------------------------------------------------
    # Actions
    # -------------------------------------------------------------------------
    def action_generate_share_link(self):
        """Generate a new share link for the trip."""
        self.ensure_one()
        return self.env['gt.share.link'].create({
            'trip_id': self.id,
        })

    def action_clone_trip(self, target_user_id=None):
        """Clone the trip (with stops and activities) for a target user."""
        self.ensure_one()
        target_user = target_user_id or self.env.user.id
        new_trip = self.copy({
            'name': f"{self.name} (Copy)",
            'user_id': target_user,
            'share_link_ids': False,
        })
        for stop in self.stop_ids:
            new_stop = stop.copy({
                'trip_id': new_trip.id,
            })
            for sa in stop.stop_activity_ids:
                sa.copy({
                    'stop_id': new_stop.id,
                })
        return new_trip

    def get_budget_breakdown(self):
        """Return budget data structured for charts."""
        self.ensure_one()
        # Category breakdown from expenses
        category_data = {}
        for expense in self.expense_ids:
            cat = expense.category or 'other'
            category_data[cat] = category_data.get(cat, 0) + expense.amount

        # Add activity costs under 'activity' category
        activity_total = sum(
            sa.final_cost for stop in self.stop_ids for sa in stop.stop_activity_ids
        )
        category_data['activity'] = category_data.get('activity', 0) + activity_total

        # Per-day breakdown
        daily_data = {}
        for stop in self.stop_ids:
            for sa in stop.stop_activity_ids:
                day_key = f"Day {sa.day_index}" if sa.day_index else "Unassigned"
                daily_data[day_key] = daily_data.get(day_key, 0) + sa.final_cost

        for expense in self.expense_ids:
            if expense.date:
                day_num = (expense.date - self.start_date).days + 1
                day_key = f"Day {day_num}"
            else:
                day_key = "Unassigned"
            daily_data[day_key] = daily_data.get(day_key, 0) + expense.amount

        return {
            'total': self.total_budget,
            'activity_total': self.activity_cost_total,
            'expense_total': self.expense_cost_total,
            'per_day_average': self.total_budget / max(self.total_days, 1),
            'category_breakdown': category_data,
            'daily_breakdown': daily_data,
            'total_days': self.total_days,
        }
