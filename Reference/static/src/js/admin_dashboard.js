/** @odoo-module */
import { Component, useState, onWillStart, onMounted, useRef } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

export class AdminDashboard extends Component {
    static template = "globetrotter.AdminDashboard";

    setup() {
        this.orm = useService("orm");
        this.state = useState({
            loading: true,
            activeTab: "overview",
            stats: { trips: 0, users: 0, cities: 0, activities: 0 },
            popularCities: [],
            popularActivities: [],
        });

        this.categoryChartRef = useRef("categoryChart");
        this.activityChartRef = useRef("activityChart");

        onWillStart(async () => {
            await this.loadDashboardData();
        });

        onMounted(() => {
            this.renderCharts();
        });
    }

    async loadDashboardData() {
        try {
            const [tripCount, userCount, cityCount, activityCount] = await Promise.all([
                this.orm.searchCount("gt.trip", []),
                this.orm.searchCount("res.users", [["share", "=", false]]),
                this.orm.searchCount("gt.city", []),
                this.orm.searchCount("gt.activity", []),
            ]);

            this.state.stats = {
                trips: tripCount,
                users: userCount,
                cities: cityCount,
                activities: activityCount,
            };

            // Popular cities (by number of stops)
            const stopGroups = await this.orm.readGroup(
                "gt.stop", [], ["city_id"], ["city_id"],
                { orderby: "city_id_count desc", limit: 10 }
            );
            this.state.popularCities = stopGroups.map(g => ({
                name: g.city_id ? g.city_id[1] : "Unknown",
                count: g.city_id_count,
            }));

            // Popular activities
            const actGroups = await this.orm.readGroup(
                "gt.stop.activity", [], ["activity_id"], ["activity_id"],
                { orderby: "activity_id_count desc", limit: 10 }
            );
            this.state.popularActivities = actGroups.map(g => ({
                name: g.activity_id ? g.activity_id[1] : "Unknown",
                count: g.activity_id_count,
            }));
        } catch (e) {
            console.error("Dashboard data load failed:", e);
        }
        this.state.loading = false;
    }

    renderCharts() {
        if (this.state.loading) return;

        // Popular cities bar chart
        if (this.activityChartRef.el && this.state.popularCities.length > 0) {
            const cities = this.state.popularCities;
            new Chart(this.activityChartRef.el.getContext("2d"), {
                type: "bar",
                data: {
                    labels: cities.map(c => c.name),
                    datasets: [{
                        label: "Trip Stops",
                        data: cities.map(c => c.count),
                        backgroundColor: "#00A699",
                        borderRadius: 6,
                    }],
                },
                options: {
                    responsive: true,
                    indexAxis: "y",
                    plugins: { legend: { display: false } },
                },
            });
        }
    }

    setTab(tab) {
        this.state.activeTab = tab;
    }
}

registry.category("actions").add("globetrotter.admin_dashboard", AdminDashboard);
