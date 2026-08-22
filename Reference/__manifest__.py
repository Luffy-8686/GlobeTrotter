# -*- coding: utf-8 -*-
{
    'name': 'GlobeTrotter',
    'version': '18.0.1.0.0',
    'summary': 'Personalized Travel Planning Platform',
    'description': """
        GlobeTrotter — Empowering Personalized Travel Planning
        ======================================================
        A personalized, intelligent, collaborative travel-planning platform.
        Design multi-city itineraries end-to-end — add stops, assign dates/activities/budgets,
        discover cities and activities via search, visualize the trip as a calendar/timeline,
        see automatic cost breakdowns, and share a read-only public version of the trip.
    """,
    'category': 'Travel',
    'author': 'GlobeTrotter Team',
    'website': 'https://globetrotter.app',
    'license': 'LGPL-3',
    'depends': ['base', 'mail', 'portal', 'web'],
    'data': [
        # Security (must load first)
        'security/gt_security.xml',
        'security/ir.model.access.csv',
        # Seed data
        'data/gt_city_activity_seed.xml',
        'data/gt_demo_trips_seed.xml',
        # Backend views
        'views/gt_model_views.xml',
        'views/menu_views.xml',
        # Portal templates
        'static/src/xml/gt_portal_layout.xml',
        'static/src/xml/gt_auth_templates.xml',
        'static/src/xml/gt_dashboard_template.xml',
        'static/src/xml/gt_create_trip_template.xml',
        'static/src/xml/gt_my_trips_template.xml',
        'static/src/xml/gt_profile_template.xml',
        'static/src/xml/gt_community_template.xml',
        'static/src/xml/gt_shared_trip_template.xml',
    ],
    'assets': {
        'web._assets_primary_variables': [
            'globetrotter/static/src/scss/primary_variables.scss',
        ],
        'web.assets_frontend': [
            # SCSS
            'globetrotter/static/src/scss/design_tokens.scss',
            'globetrotter/static/src/scss/layout.scss',
            'globetrotter/static/src/scss/components.scss',
            'globetrotter/static/src/scss/pages.scss',
            'globetrotter/static/src/scss/utilities.scss',
            # OWL Component Templates (XML)
            'globetrotter/static/src/xml/components/toast.xml',
            'globetrotter/static/src/xml/components/modal.xml',
            'globetrotter/static/src/xml/components/skeleton_loader.xml',
            'globetrotter/static/src/xml/components/empty_state.xml',
            'globetrotter/static/src/xml/components/tabs.xml',
            'globetrotter/static/src/xml/components/trip_card.xml',
            'globetrotter/static/src/xml/components/city_card.xml',
            'globetrotter/static/src/xml/components/activity_card.xml',
            'globetrotter/static/src/xml/date_range_picker.xml',
            'globetrotter/static/src/xml/itinerary_builder.xml',
            'globetrotter/static/src/xml/itinerary_view.xml',
            'globetrotter/static/src/xml/budget_chart.xml',
            'globetrotter/static/src/xml/city_search.xml',
            'globetrotter/static/src/xml/activity_search.xml',
            'globetrotter/static/src/xml/trip_calendar.xml',
            # OWL Component JS
            'globetrotter/static/src/js/components/toast.js',
            'globetrotter/static/src/js/components/modal.js',
            'globetrotter/static/src/js/components/skeleton_loader.js',
            'globetrotter/static/src/js/components/empty_state.js',
            'globetrotter/static/src/js/components/tabs.js',
            'globetrotter/static/src/js/components/trip_card.js',
            'globetrotter/static/src/js/components/city_card.js',
            'globetrotter/static/src/js/components/activity_card.js',
            'globetrotter/static/src/js/date_range_picker.js',
            'globetrotter/static/src/js/itinerary_builder.js',
            'globetrotter/static/src/js/itinerary_view.js',
            'globetrotter/static/src/js/budget_chart.js',
            'globetrotter/static/src/js/city_search.js',
            'globetrotter/static/src/js/activity_search.js',
            'globetrotter/static/src/js/trip_calendar.js',
        ],
        'web.assets_backend': [
            'globetrotter/static/src/scss/design_tokens.scss',
            'globetrotter/static/src/scss/components.scss',
            'globetrotter/static/src/xml/admin_dashboard.xml',
            'globetrotter/static/src/js/admin_dashboard.js',
        ],
    },
    'installable': True,
    'application': True,
    'auto_install': False,
}
