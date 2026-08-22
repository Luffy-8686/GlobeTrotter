# -*- coding: utf-8 -*-
import base64
import json
from datetime import date, datetime

from odoo import http
from odoo.http import request
from odoo.exceptions import AccessError, ValidationError


class GlobeTrotterMain(http.Controller):
    """Authenticated portal controllers for GlobeTrotter."""

    # =========================================================================
    # Auth / Login / Signup
    # =========================================================================
    @http.route('/globetrotter/login', type='http', auth='public', website=True)
    def gt_login(self, **kw):
        """Custom login page."""
        if request.env.user and request.env.user.id != request.env.ref('base.public_user').id:
            return request.redirect('/globetrotter')
        return request.render('globetrotter.gt_login_page', {
            'error': kw.get('error', ''),
        })

    @http.route('/globetrotter/signup', type='http', auth='public', website=True)
    def gt_signup(self, **kw):
        """Custom signup page."""
        if request.env.user and request.env.user.id != request.env.ref('base.public_user').id:
            return request.redirect('/globetrotter')
        return request.render('globetrotter.gt_signup_page', {
            'error': kw.get('error', ''),
        })

    # =========================================================================
    # Dashboard
    # =========================================================================
    @http.route(['/globetrotter', '/globetrotter/dashboard'], type='http', auth='user', website=True)
    def gt_dashboard(self, **kw):
        """Main dashboard (Screen 2)."""
        user = request.env.user
        Trip = request.env['gt.trip'].sudo()
        City = request.env['gt.city'].sudo()

        # User's recent trips (most recent first, limit 8)
        my_trips = Trip.search([('user_id', '=', user.id)], order='write_date desc', limit=8)

        # Top cities by popularity
        top_cities = City.search([], order='popularity_score desc', limit=8)

        return request.render('globetrotter.gt_dashboard_page', {
            'user': user,
            'my_trips': my_trips,
            'top_cities': top_cities,
        })

    # =========================================================================
    # Create Trip (Screen 3)
    # =========================================================================
    @http.route('/globetrotter/trip/create', type='http', auth='user', website=True, methods=['GET'])
    def gt_create_trip_form(self, **kw):
        """Render create trip form."""
        return request.render('globetrotter.gt_create_trip_page', {})

    @http.route('/globetrotter/trip/create', type='http', auth='user', website=True, methods=['POST'], csrf=True)
    def gt_create_trip_submit(self, **kw):
        """Handle create trip form submission."""
        try:
            vals = {
                'name': kw.get('name', '').strip(),
                'description': kw.get('description', '').strip(),
                'start_date': kw.get('start_date'),
                'end_date': kw.get('end_date'),
                'user_id': request.env.user.id,
            }
            # Handle cover image upload
            cover = kw.get('cover_image')
            if cover and hasattr(cover, 'read'):
                vals['cover_image'] = base64.b64encode(cover.read())

            trip = request.env['gt.trip'].sudo().create(vals)
            return request.redirect(f'/globetrotter/trip/{trip.id}/edit')
        except (ValidationError, Exception) as e:
            return request.render('globetrotter.gt_create_trip_page', {
                'error': str(e),
                'values': kw,
            })

    # =========================================================================
    # Itinerary Builder (Screen 4/5)
    # =========================================================================
    @http.route('/globetrotter/trip/<int:trip_id>/edit', type='http', auth='user', website=True)
    def gt_itinerary_builder(self, trip_id, **kw):
        """Itinerary builder page."""
        trip = request.env['gt.trip'].sudo().browse(trip_id)
        if not trip.exists() or trip.user_id.id != request.env.user.id:
            return request.redirect('/globetrotter')
        return request.render('globetrotter.gt_itinerary_builder_page', {
            'trip': trip,
        })

    # =========================================================================
    # Itinerary View (Screen 6)
    # =========================================================================
    @http.route('/globetrotter/trip/<int:trip_id>', type='http', auth='user', website=True)
    def gt_itinerary_view(self, trip_id, **kw):
        """Itinerary view page."""
        trip = request.env['gt.trip'].sudo().browse(trip_id)
        if not trip.exists() or trip.user_id.id != request.env.user.id:
            return request.redirect('/globetrotter')

        # Organize activities by day
        days_data = {}
        for stop in trip.stop_ids:
            for sa in stop.stop_activity_ids:
                day_key = sa.day_index or 1
                if day_key not in days_data:
                    days_data[day_key] = {
                        'day': day_key,
                        'activities': [],
                        'total_cost': 0,
                    }
                days_data[day_key]['activities'].append(sa)
                days_data[day_key]['total_cost'] += sa.final_cost

        sorted_days = sorted(days_data.values(), key=lambda d: d['day'])

        return request.render('globetrotter.gt_itinerary_view_page', {
            'trip': trip,
            'days_data': sorted_days,
        })

    # =========================================================================
    # Budget & Cost Breakdown (Screen 9)
    # =========================================================================
    @http.route('/globetrotter/trip/<int:trip_id>/budget', type='http', auth='user', website=True)
    def gt_budget_page(self, trip_id, **kw):
        """Budget and cost breakdown page."""
        trip = request.env['gt.trip'].sudo().browse(trip_id)
        if not trip.exists() or trip.user_id.id != request.env.user.id:
            return request.redirect('/globetrotter')

        budget_data = trip.get_budget_breakdown()
        return request.render('globetrotter.gt_budget_page', {
            'trip': trip,
            'budget_data': json.dumps(budget_data),
        })

    # =========================================================================
    # My Trips (Screen 7)
    # =========================================================================
    @http.route('/globetrotter/trips', type='http', auth='user', website=True)
    def gt_my_trips(self, **kw):
        """My trips page with tabs."""
        user = request.env.user
        Trip = request.env['gt.trip'].sudo()
        today = date.today()

        ongoing = Trip.search([
            ('user_id', '=', user.id),
            ('start_date', '<=', today),
            ('end_date', '>=', today),
        ], order='start_date asc')

        upcoming = Trip.search([
            ('user_id', '=', user.id),
            ('start_date', '>', today),
        ], order='start_date asc')

        completed = Trip.search([
            ('user_id', '=', user.id),
            ('end_date', '<', today),
        ], order='end_date desc')

        return request.render('globetrotter.gt_my_trips_page', {
            'ongoing_trips': ongoing,
            'upcoming_trips': upcoming,
            'completed_trips': completed,
            'active_tab': kw.get('tab', 'ongoing'),
        })

    # =========================================================================
    # City Search (Screen 8)
    # =========================================================================
    @http.route('/globetrotter/explore/cities', type='http', auth='user', website=True)
    def gt_city_search(self, **kw):
        """City search/explore page."""
        City = request.env['gt.city'].sudo()
        domain = []
        search_query = kw.get('q', '').strip()
        region_filter = kw.get('region', '')

        if search_query:
            domain += ['|', ('name', 'ilike', search_query), ('country', 'ilike', search_query)]
        if region_filter:
            domain += [('region', '=', region_filter)]

        sort = kw.get('sort', 'popularity_score desc')
        cities = City.search(domain, order=sort)

        return request.render('globetrotter.gt_city_search_page', {
            'cities': cities,
            'search_query': search_query,
            'region_filter': region_filter,
            'sort': sort,
        })

    # =========================================================================
    # Activity Search (Screen 8)
    # =========================================================================
    @http.route('/globetrotter/explore/activities', type='http', auth='user', website=True)
    def gt_activity_search(self, **kw):
        """Activity search/explore page."""
        Activity = request.env['gt.activity'].sudo()
        domain = []
        search_query = kw.get('q', '').strip()
        category_filter = kw.get('category', '')
        city_filter = kw.get('city_id', '')

        if search_query:
            domain += ['|', '|',
                        ('name', 'ilike', search_query),
                        ('city_name', 'ilike', search_query),
                        ('description', 'ilike', search_query)]
        if category_filter:
            domain += [('category', '=', category_filter)]
        if city_filter:
            domain += [('city_id', '=', int(city_filter))]

        activities = Activity.search(domain, order='name asc')

        return request.render('globetrotter.gt_activity_search_page', {
            'activities': activities,
            'search_query': search_query,
            'category_filter': category_filter,
            'city_filter': city_filter,
        })

    # =========================================================================
    # Calendar View (Screen 10)
    # =========================================================================
    @http.route('/globetrotter/calendar', type='http', auth='user', website=True)
    def gt_calendar(self, **kw):
        """Calendar/timeline view."""
        user = request.env.user
        trips = request.env['gt.trip'].sudo().search([
            ('user_id', '=', user.id),
        ], order='start_date asc')

        trips_data = []
        for trip in trips:
            trips_data.append({
                'id': trip.id,
                'name': trip.name,
                'start_date': str(trip.start_date) if trip.start_date else '',
                'end_date': str(trip.end_date) if trip.end_date else '',
                'state': trip.state,
            })

        return request.render('globetrotter.gt_calendar_page', {
            'trips': trips,
            'trips_json': json.dumps(trips_data),
        })

    # =========================================================================
    # Community (Screen 13)
    # =========================================================================
    @http.route('/globetrotter/community', type='http', auth='user', website=True)
    def gt_community(self, **kw):
        """Community feed of shared trips."""
        ShareLink = request.env['gt.share.link'].sudo()
        active_links = ShareLink.search([('is_active', '=', True)], order='created_date desc', limit=50)

        shared_trips = []
        seen_trip_ids = set()
        for link in active_links:
            if link.trip_id.id not in seen_trip_ids:
                shared_trips.append(link.trip_id)
                seen_trip_ids.add(link.trip_id.id)

        return request.render('globetrotter.gt_community_page', {
            'shared_trips': shared_trips,
        })

    # =========================================================================
    # Profile / Settings (Screen 12)
    # =========================================================================
    @http.route('/globetrotter/profile', type='http', auth='user', website=True, methods=['GET'])
    def gt_profile(self, **kw):
        """User profile page."""
        return request.render('globetrotter.gt_profile_page', {
            'user': request.env.user,
        })

    @http.route('/globetrotter/profile/update', type='http', auth='user', website=True, methods=['POST'], csrf=True)
    def gt_profile_update(self, **kw):
        """Handle profile update."""
        user = request.env.user
        vals = {}
        if kw.get('name'):
            vals['name'] = kw['name'].strip()
        if kw.get('bio') is not None:
            vals['bio'] = kw['bio'].strip()
        if kw.get('travel_preferences') is not None:
            vals['travel_preferences'] = kw['travel_preferences'].strip()

        avatar = kw.get('avatar')
        if avatar and hasattr(avatar, 'read'):
            vals['image_1920'] = base64.b64encode(avatar.read())

        if vals:
            user.sudo().write(vals)

        return request.redirect('/globetrotter/profile')

    # =========================================================================
    # JSON API Endpoints (for OWL components via RPC)
    # =========================================================================
    @http.route('/globetrotter/api/trip/<int:trip_id>/data', type='json', auth='user')
    def api_trip_data(self, trip_id, **kw):
        """Return full trip data for the itinerary builder OWL component."""
        trip = request.env['gt.trip'].sudo().browse(trip_id)
        if not trip.exists() or trip.user_id.id != request.env.user.id:
            return {'error': 'Not found'}

        stops = []
        for stop in trip.stop_ids.sorted('sequence'):
            activities = []
            for sa in stop.stop_activity_ids.sorted('sequence'):
                activities.append({
                    'id': sa.id,
                    'activity_id': sa.activity_id.id,
                    'activity_name': sa.activity_name,
                    'activity_category': sa.activity_category,
                    'activity_description': sa.activity_description or '',
                    'day_index': sa.day_index,
                    'time_slot': sa.time_slot,
                    'final_cost': sa.final_cost,
                    'cost_override': sa.cost_override,
                    'sequence': sa.sequence,
                    'notes': sa.notes or '',
                    'duration_hours': sa.activity_duration,
                })
            stops.append({
                'id': stop.id,
                'city_id': stop.city_id.id,
                'city_name': stop.city_name,
                'city_country': stop.city_country or '',
                'arrival_date': str(stop.arrival_date) if stop.arrival_date else '',
                'departure_date': str(stop.departure_date) if stop.departure_date else '',
                'sequence': stop.sequence,
                'duration_days': stop.duration_days,
                'stop_budget': stop.stop_budget,
                'activity_count': stop.activity_count,
                'activities': activities,
                'notes': stop.notes or '',
            })

        return {
            'id': trip.id,
            'name': trip.name,
            'description': trip.description or '',
            'start_date': str(trip.start_date) if trip.start_date else '',
            'end_date': str(trip.end_date) if trip.end_date else '',
            'total_budget': trip.total_budget,
            'total_days': trip.total_days,
            'destination_count': trip.destination_count,
            'state': trip.state,
            'stops': stops,
        }

    @http.route('/globetrotter/api/cities/search', type='json', auth='user')
    def api_cities_search(self, query='', limit=10, **kw):
        """Search cities for autocomplete."""
        City = request.env['gt.city'].sudo()
        domain = []
        if query:
            domain = ['|', ('name', 'ilike', query), ('country', 'ilike', query)]
        cities = City.search(domain, limit=limit, order='popularity_score desc')
        return [{
            'id': c.id,
            'name': c.name,
            'country': c.country,
            'region': c.region,
            'cost_index': c.cost_index,
            'popularity_score': c.popularity_score,
            'activity_count': c.activity_count,
        } for c in cities]

    @http.route('/globetrotter/api/activities/search', type='json', auth='user')
    def api_activities_search(self, city_id=None, query='', category='', limit=20, **kw):
        """Search activities, optionally filtered by city."""
        Activity = request.env['gt.activity'].sudo()
        domain = []
        if city_id:
            domain.append(('city_id', '=', city_id))
        if query:
            domain.append(('name', 'ilike', query))
        if category:
            domain.append(('category', '=', category))
        activities = Activity.search(domain, limit=limit, order='name asc')
        return [{
            'id': a.id,
            'name': a.name,
            'category': a.category,
            'description': a.description or '',
            'estimated_cost': a.estimated_cost,
            'duration_hours': a.duration_hours,
            'city_id': a.city_id.id,
            'city_name': a.city_name,
        } for a in activities]

    @http.route('/globetrotter/api/stop/create', type='json', auth='user')
    def api_stop_create(self, trip_id, city_id, arrival_date=None, departure_date=None, **kw):
        """Create a new stop."""
        trip = request.env['gt.trip'].sudo().browse(trip_id)
        if not trip.exists() or trip.user_id.id != request.env.user.id:
            return {'error': 'Not authorized'}

        max_seq = max(trip.stop_ids.mapped('sequence') or [0])
        stop = request.env['gt.stop'].sudo().create({
            'trip_id': trip_id,
            'city_id': city_id,
            'arrival_date': arrival_date or False,
            'departure_date': departure_date or False,
            'sequence': max_seq + 10,
        })
        return {'id': stop.id, 'sequence': stop.sequence}

    @http.route('/globetrotter/api/stop/delete', type='json', auth='user')
    def api_stop_delete(self, stop_id, **kw):
        """Delete a stop."""
        stop = request.env['gt.stop'].sudo().browse(stop_id)
        if not stop.exists() or stop.trip_id.user_id.id != request.env.user.id:
            return {'error': 'Not authorized'}
        stop.unlink()
        return {'success': True}

    @http.route('/globetrotter/api/stop/reorder', type='json', auth='user')
    def api_stop_reorder(self, trip_id, stop_order, **kw):
        """Reorder stops. stop_order = list of stop IDs in new order."""
        trip = request.env['gt.trip'].sudo().browse(trip_id)
        if not trip.exists() or trip.user_id.id != request.env.user.id:
            return {'error': 'Not authorized'}

        for idx, stop_id in enumerate(stop_order):
            request.env['gt.stop'].sudo().browse(stop_id).write({'sequence': (idx + 1) * 10})
        return {'success': True}

    @http.route('/globetrotter/api/stop_activity/add', type='json', auth='user')
    def api_stop_activity_add(self, stop_id, activity_id, day_index=1, time_slot='morning', **kw):
        """Add an activity to a stop."""
        stop = request.env['gt.stop'].sudo().browse(stop_id)
        if not stop.exists() or stop.trip_id.user_id.id != request.env.user.id:
            return {'error': 'Not authorized'}

        max_seq = max(stop.stop_activity_ids.mapped('sequence') or [0])
        sa = request.env['gt.stop.activity'].sudo().create({
            'stop_id': stop_id,
            'activity_id': activity_id,
            'day_index': day_index,
            'time_slot': time_slot,
            'sequence': max_seq + 10,
        })
        return {
            'id': sa.id,
            'activity_name': sa.activity_name,
            'final_cost': sa.final_cost,
        }

    @http.route('/globetrotter/api/stop_activity/remove', type='json', auth='user')
    def api_stop_activity_remove(self, stop_activity_id, **kw):
        """Remove an activity from a stop."""
        sa = request.env['gt.stop.activity'].sudo().browse(stop_activity_id)
        if not sa.exists() or sa.stop_id.trip_id.user_id.id != request.env.user.id:
            return {'error': 'Not authorized'}
        sa.unlink()
        return {'success': True}

    @http.route('/globetrotter/api/stop_activity/reorder', type='json', auth='user')
    def api_stop_activity_reorder(self, stop_id, activity_order, **kw):
        """Reorder activities within a stop."""
        stop = request.env['gt.stop'].sudo().browse(stop_id)
        if not stop.exists() or stop.trip_id.user_id.id != request.env.user.id:
            return {'error': 'Not authorized'}

        for idx, sa_id in enumerate(activity_order):
            request.env['gt.stop.activity'].sudo().browse(sa_id).write({'sequence': (idx + 1) * 10})
        return {'success': True}

    @http.route('/globetrotter/api/expense/create', type='json', auth='user')
    def api_expense_create(self, trip_id, name, category, amount, expense_date=None, notes='', **kw):
        """Add a manual expense."""
        trip = request.env['gt.trip'].sudo().browse(trip_id)
        if not trip.exists() or trip.user_id.id != request.env.user.id:
            return {'error': 'Not authorized'}

        expense = request.env['gt.expense'].sudo().create({
            'trip_id': trip_id,
            'name': name,
            'category': category,
            'amount': float(amount),
            'date': expense_date or False,
            'notes': notes,
        })
        return {'id': expense.id}

    @http.route('/globetrotter/api/expense/delete', type='json', auth='user')
    def api_expense_delete(self, expense_id, **kw):
        """Delete an expense."""
        expense = request.env['gt.expense'].sudo().browse(expense_id)
        if not expense.exists() or expense.trip_id.user_id.id != request.env.user.id:
            return {'error': 'Not authorized'}
        expense.unlink()
        return {'success': True}

    @http.route('/globetrotter/api/trip/<int:trip_id>/share', type='json', auth='user')
    def api_trip_share(self, trip_id, **kw):
        """Generate a share link."""
        trip = request.env['gt.trip'].sudo().browse(trip_id)
        if not trip.exists() or trip.user_id.id != request.env.user.id:
            return {'error': 'Not authorized'}

        link = trip.action_generate_share_link()
        return {
            'token': link.token,
            'share_url': link.share_url,
        }

    @http.route('/globetrotter/api/trip/<int:trip_id>/delete', type='json', auth='user')
    def api_trip_delete(self, trip_id, **kw):
        """Delete a trip."""
        trip = request.env['gt.trip'].sudo().browse(trip_id)
        if not trip.exists() or trip.user_id.id != request.env.user.id:
            return {'error': 'Not authorized'}
        trip.unlink()
        return {'success': True}

    @http.route('/globetrotter/api/trip/<int:trip_id>/budget_data', type='json', auth='user')
    def api_budget_data(self, trip_id, **kw):
        """Return budget breakdown data for Chart.js."""
        trip = request.env['gt.trip'].sudo().browse(trip_id)
        if not trip.exists() or trip.user_id.id != request.env.user.id:
            return {'error': 'Not authorized'}
        return trip.get_budget_breakdown()
