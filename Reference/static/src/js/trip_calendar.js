/** @odoo-module */
import { Component, useState, onMounted } from "@odoo/owl";
import { registry } from "@web/core/registry";

export class TripCalendar extends Component {
    static template = "globetrotter.TripCalendar";

    setup() {
        this.state = useState({
            currentYear: new Date().getFullYear(),
            currentMonth: new Date().getMonth(),
            trips: [],
        });

        onMounted(() => {
            const el = document.getElementById("gt-calendar-root");
            if (el && el.dataset.trips) {
                try {
                    this.state.trips = JSON.parse(el.dataset.trips);
                } catch (e) {
                    console.error("Failed to parse trips data:", e);
                }
            }
        });
    }

    get monthName() {
        return new Date(this.state.currentYear, this.state.currentMonth).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });
    }

    get weekDays() {
        return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    }

    get calendarDays() {
        const year = this.state.currentYear;
        const month = this.state.currentMonth;
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        const days = [];

        // Padding for days before first of month
        for (let i = 0; i < firstDay; i++) {
            days.push({ num: null, isToday: false, trips: [] });
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

            // Find trips that span this date
            const dayTrips = this.state.trips.filter(t => {
                return t.start_date && t.end_date && dateStr >= t.start_date && dateStr <= t.end_date;
            });

            days.push({
                num: d,
                date: dateStr,
                isToday,
                trips: dayTrips,
            });
        }

        return days;
    }

    prevMonth() {
        if (this.state.currentMonth === 0) {
            this.state.currentMonth = 11;
            this.state.currentYear--;
        } else {
            this.state.currentMonth--;
        }
    }

    nextMonth() {
        if (this.state.currentMonth === 11) {
            this.state.currentMonth = 0;
            this.state.currentYear++;
        } else {
            this.state.currentMonth++;
        }
    }

    goToTrip(tripId) {
        window.location.href = "/globetrotter/trip/" + tripId;
    }
}

registry.category("public_components").add("globetrotter.TripCalendar", TripCalendar);
