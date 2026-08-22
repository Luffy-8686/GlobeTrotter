# -*- coding: utf-8 -*-
from odoo import models, fields


class GtExpense(models.Model):
    _name = 'gt.expense'
    _description = 'GlobeTrotter Expense'
    _order = 'date asc, id asc'

    trip_id = fields.Many2one(
        'gt.trip',
        string='Trip',
        required=True,
        ondelete='cascade',
        index=True,
    )
    name = fields.Char(string='Description', required=True)
    category = fields.Selection([
        ('transport', 'Transport'),
        ('stay', 'Accommodation'),
        ('activity', 'Activity'),
        ('meal', 'Food & Meals'),
        ('other', 'Other'),
    ], string='Category', required=True, default='other')
    amount = fields.Float(string='Amount', required=True, digits=(12, 2))
    date = fields.Date(string='Date')
    notes = fields.Text(string='Notes')

    # Related for security
    user_id = fields.Many2one(related='trip_id.user_id', string='Owner', store=True)

    _sql_constraints = [
        ('check_amount_positive', 'CHECK(amount >= 0)',
         'Expense amount cannot be negative!'),
    ]

    def name_get(self):
        result = []
        for expense in self:
            cat_label = dict(self._fields['category'].selection).get(expense.category, '')
            result.append((expense.id, f"{expense.name} ({cat_label}: {expense.amount:.2f})"))
        return result
