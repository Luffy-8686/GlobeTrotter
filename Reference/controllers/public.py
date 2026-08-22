# -*- coding: utf-8 -*-
import json
from odoo import http
from odoo.http import request


class GlobeTrotterPublic(http.Controller):
    """Public (unauthenticated) controllers for GlobeTrotter."""

    @http.route('/trip/shared/<string:token>', type='http', auth='public', website=True)
    def shared_trip_view(self, token, **kw):
        """Public shared trip view — no auth required."""
        ShareLink = request.env['gt.share.link'].sudo()
        link = ShareLink.search([('token', '=', token), ('is_active', '=', True)], limit=1)

        if not link:
            return request.render('globetrotter.gt_shared_not_found', {})

        # Increment view count
        link.increment_view_count()

        trip = link.trip_id

        # Organize activities by day
        days_data = {}
        for stop in trip.stop_ids.sorted('sequence'):
            for sa in stop.stop_activity_ids.sorted('sequence'):
                day_key = sa.day_index or 1
                if day_key not in days_data:
                    days_data[day_key] = {
                        'day': day_key,
                        'activities': [],
                        'total_cost': 0,
                        'stop': stop,
                    }
                days_data[day_key]['activities'].append(sa)
                days_data[day_key]['total_cost'] += sa.final_cost

        sorted_days = sorted(days_data.values(), key=lambda d: d['day'])

        # Check if current user is logged in (for "Copy Trip" feature)
        is_logged_in = (
            request.env.user and
            request.env.user.id != request.env.ref('base.public_user').id
        )

        return request.render('globetrotter.gt_shared_trip_page', {
            'trip': trip,
            'days_data': sorted_days,
            'share_link': link,
            'is_logged_in': is_logged_in,
            'token': token,
        })

    @http.route('/trip/shared/<string:token>/copy', type='http', auth='user', website=True, methods=['POST'], csrf=True)
    def copy_shared_trip(self, token, **kw):
        """Clone a shared trip into the logged-in user's account."""
        ShareLink = request.env['gt.share.link'].sudo()
        link = ShareLink.search([('token', '=', token), ('is_active', '=', True)], limit=1)

        if not link:
            return request.redirect('/globetrotter')

        trip = link.trip_id
        new_trip = trip.action_clone_trip(target_user_id=request.env.user.id)

        return request.redirect(f'/globetrotter/trip/{new_trip.id}/edit')
