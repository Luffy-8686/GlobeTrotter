/** @odoo-module */
import { Component, useState, onWillStart, onMounted, useRef } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

export class ItineraryBuilder extends Component {
    static template = "globetrotter.ItineraryBuilder";

    setup() {
        this.rpc = useService("rpc");
        this.state = useState({
            trip: null,
            stops: [],
            loading: true,
            showCitySearch: false,
            citySearchQuery: "",
            cityResults: [],
            expandedStops: {},
            showActivityPicker: null,
            activitySearchQuery: "",
            activityResults: [],
            draggedStopId: null,
        });

        this.rootRef = useRef("root");

        onWillStart(async () => {
            await this.loadTripData();
        });
    }

    get tripId() {
        const el = document.getElementById("gt-itinerary-builder-root");
        return el ? parseInt(el.dataset.tripId) : null;
    }

    async loadTripData() {
        this.state.loading = true;
        try {
            const data = await this.rpc("/globetrotter/api/trip/" + this.tripId + "/data", {});
            this.state.trip = data;
            this.state.stops = data.stops || [];
            // Auto-expand first stop
            if (this.state.stops.length > 0) {
                this.state.expandedStops[this.state.stops[0].id] = true;
            }
        } catch (e) {
            console.error("Failed to load trip data:", e);
        }
        this.state.loading = false;
    }

    toggleStop(stopId) {
        this.state.expandedStops[stopId] = !this.state.expandedStops[stopId];
    }

    isExpanded(stopId) {
        return !!this.state.expandedStops[stopId];
    }

    // -----------------------------------------------------------------------
    // City Search (Add Stop)
    // -----------------------------------------------------------------------
    openCitySearch() {
        this.state.showCitySearch = true;
        this.state.citySearchQuery = "";
        this.state.cityResults = [];
    }

    closeCitySearch() {
        this.state.showCitySearch = false;
    }

    async onCitySearchInput(ev) {
        const query = ev.target.value;
        this.state.citySearchQuery = query;
        if (query.length < 2) {
            this.state.cityResults = [];
            return;
        }
        try {
            const results = await this.rpc("/globetrotter/api/cities/search", {
                query: query,
                limit: 8,
            });
            this.state.cityResults = results;
        } catch (e) {
            console.error("City search failed:", e);
        }
    }

    async selectCity(cityId) {
        try {
            const result = await this.rpc("/globetrotter/api/stop/create", {
                trip_id: this.tripId,
                city_id: cityId,
            });
            this.closeCitySearch();
            await this.loadTripData();
            // Auto-expand the new stop
            this.state.expandedStops[result.id] = true;
        } catch (e) {
            console.error("Failed to add stop:", e);
        }
    }

    // -----------------------------------------------------------------------
    // Activity Picker
    // -----------------------------------------------------------------------
    openActivityPicker(stopId, cityId) {
        this.state.showActivityPicker = { stopId, cityId };
        this.state.activitySearchQuery = "";
        this.state.activityResults = [];
        this.searchActivities(cityId, "");
    }

    closeActivityPicker() {
        this.state.showActivityPicker = null;
    }

    async onActivitySearchInput(ev) {
        const query = ev.target.value;
        this.state.activitySearchQuery = query;
        const picker = this.state.showActivityPicker;
        if (picker) {
            await this.searchActivities(picker.cityId, query);
        }
    }

    async searchActivities(cityId, query) {
        try {
            const results = await this.rpc("/globetrotter/api/activities/search", {
                city_id: cityId,
                query: query,
                limit: 20,
            });
            this.state.activityResults = results;
        } catch (e) {
            console.error("Activity search failed:", e);
        }
    }

    async addActivity(activityId) {
        const picker = this.state.showActivityPicker;
        if (!picker) return;
        try {
            await this.rpc("/globetrotter/api/stop_activity/add", {
                stop_id: picker.stopId,
                activity_id: activityId,
            });
            await this.loadTripData();
        } catch (e) {
            console.error("Failed to add activity:", e);
        }
    }

    async removeActivity(stopActivityId) {
        try {
            await this.rpc("/globetrotter/api/stop_activity/remove", {
                stop_activity_id: stopActivityId,
            });
            await this.loadTripData();
        } catch (e) {
            console.error("Failed to remove activity:", e);
        }
    }

    // -----------------------------------------------------------------------
    // Delete Stop
    // -----------------------------------------------------------------------
    async deleteStop(stopId) {
        if (!confirm("Remove this stop and all its activities?")) return;
        try {
            await this.rpc("/globetrotter/api/stop/delete", { stop_id: stopId });
            await this.loadTripData();
        } catch (e) {
            console.error("Failed to delete stop:", e);
        }
    }

    // -----------------------------------------------------------------------
    // Drag & Drop (Stop Reorder)
    // -----------------------------------------------------------------------
    onDragStartStop(ev, stopId) {
        this.state.draggedStopId = stopId;
        ev.dataTransfer.effectAllowed = "move";
        ev.target.classList.add("gt-dragging");
    }

    onDragEndStop(ev) {
        this.state.draggedStopId = null;
        ev.target.classList.remove("gt-dragging");
    }

    onDragOverStop(ev) {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "move";
    }

    async onDropStop(ev, targetStopId) {
        ev.preventDefault();
        const draggedId = this.state.draggedStopId;
        if (!draggedId || draggedId === targetStopId) return;

        // Reorder locally
        const stops = [...this.state.stops];
        const draggedIdx = stops.findIndex(s => s.id === draggedId);
        const targetIdx = stops.findIndex(s => s.id === targetStopId);
        if (draggedIdx === -1 || targetIdx === -1) return;

        const [dragged] = stops.splice(draggedIdx, 1);
        stops.splice(targetIdx, 0, dragged);
        this.state.stops = stops;

        // Persist order via RPC
        try {
            await this.rpc("/globetrotter/api/stop/reorder", {
                trip_id: this.tripId,
                stop_order: stops.map(s => s.id),
            });
        } catch (e) {
            console.error("Failed to reorder stops:", e);
            await this.loadTripData();
        }
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------
    getTimeSlotLabel(slot) {
        const labels = {
            morning: "Morning (6AM–12PM)",
            afternoon: "Afternoon (12PM–5PM)",
            evening: "Evening (5PM–9PM)",
            night: "Night (9PM–12AM)",
        };
        return labels[slot] || slot;
    }

    getCategoryEmoji(cat) {
        const emojis = {
            sightseeing: "🏛️",
            food: "🍽️",
            adventure: "🏔️",
            culture: "🎭",
            shopping: "🛍️",
            nightlife: "🌙",
            nature: "🌿",
            wellness: "🧘",
        };
        return emojis[cat] || "📌";
    }

    formatCost(cost) {
        return "₹" + Number(cost || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
    }

    isActivityAdded(stopId, activityId) {
        const stop = this.state.stops.find(s => s.id === stopId);
        if (!stop) return false;
        return stop.activities.some(a => a.activity_id === activityId);
    }
}

registry.category("public_components").add("globetrotter.ItineraryBuilder", ItineraryBuilder);
