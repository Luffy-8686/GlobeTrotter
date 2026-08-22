# -*- coding: utf-8 -*-
import uuid
from odoo import models, fields, api


class GtShareLink(models.Model):
    _name = 'gt.share.link'
    _description = 'GlobeTrotter Share Link'
    _order = 'created_date desc'

    trip_id = fields.Many2one(
        'gt.trip',
        string='Trip',
        required=True,
        ondelete='cascade',
        index=True,
    )
    token = fields.Char(
        string='Share Token',
        default=lambda self: str(uuid.uuid4()),
        readonly=True,
        required=True,
        copy=False,
        index=True,
    )
    is_active = fields.Boolean(string='Active', default=True)
    view_count = fields.Integer(string='View Count', default=0)
    created_date = fields.Datetime(string='Created Date', default=fields.Datetime.now)

    # Computed
    share_url = fields.Char(string='Share URL', compute='_compute_share_url')

    # Related for security
    user_id = fields.Many2one(related='trip_id.user_id', string='Owner', store=True)

    _sql_constraints = [
        ('unique_token', 'UNIQUE(token)', 'Share token must be unique!'),
    ]

    @api.depends('token')
    def _compute_share_url(self):
        base_url = self.env['ir.config_parameter'].sudo().get_param('web.base.url', '')
        for link in self:
            link.share_url = f"{base_url}/trip/shared/{link.token}"

    def increment_view_count(self):
        """Increment view count atomically using SQL for accuracy under concurrency."""
        for link in self:
            self.env.cr.execute(
                "UPDATE gt_share_link SET view_count = view_count + 1 WHERE id = %s",
                (link.id,)
            )
        self.invalidate_recordset(['view_count'])

    def action_deactivate(self):
        """Deactivate the share link."""
        self.write({'is_active': False})

    def action_activate(self):
        """Reactivate the share link."""
        self.write({'is_active': True})
