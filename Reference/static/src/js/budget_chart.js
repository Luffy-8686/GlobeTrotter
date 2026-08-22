/** @odoo-module */
import { Component, useState, onMounted, useRef, onWillStart } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

export class BudgetChart extends Component {
    static template = "globetrotter.BudgetChart";

    setup() {
        this.rpc = useService("rpc");
        this.pieRef = useRef("pieChart");
        this.barRef = useRef("barChart");
        this.state = useState({
            budgetData: null,
            loading: true,
        });

        onWillStart(async () => {
            await this.loadBudgetData();
        });

        onMounted(() => {
            if (this.state.budgetData) {
                this.renderCharts();
            }
        });
    }

    get tripId() {
        const el = document.getElementById("gt-budget-chart-root");
        return el ? parseInt(el.dataset.tripId) : null;
    }

    async loadBudgetData() {
        try {
            const data = await this.rpc("/globetrotter/api/trip/" + this.tripId + "/budget_data", {});
            this.state.budgetData = data;
        } catch (e) {
            console.error("Failed to load budget data:", e);
        }
        this.state.loading = false;
    }

    renderCharts() {
        const data = this.state.budgetData;
        if (!data) return;

        // Category labels and colors
        const categoryLabels = {
            transport: "Transport",
            stay: "Accommodation",
            activity: "Activities",
            meal: "Food & Meals",
            other: "Other",
        };
        const categoryColors = {
            transport: "#FF5A5F",
            stay: "#00A699",
            activity: "#FFB020",
            meal: "#FF8A80",
            other: "#767676",
        };

        // Pie Chart
        if (this.pieRef.el && data.category_breakdown) {
            const categories = Object.keys(data.category_breakdown);
            const values = categories.map(c => data.category_breakdown[c]);
            const labels = categories.map(c => categoryLabels[c] || c);
            const colors = categories.map(c => categoryColors[c] || "#E5E5E5");

            new Chart(this.pieRef.el.getContext("2d"), {
                type: "doughnut",
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: colors,
                        borderWidth: 2,
                        borderColor: "#FFFFFF",
                    }],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: "bottom",
                            labels: { font: { family: "'Poppins', sans-serif", size: 13 } },
                        },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => {
                                    const val = ctx.parsed;
                                    return ` ${ctx.label}: ₹${val.toLocaleString("en-IN")}`;
                                },
                            },
                        },
                    },
                },
            });
        }

        // Bar Chart (Daily)
        if (this.barRef.el && data.daily_breakdown) {
            const days = Object.keys(data.daily_breakdown).sort((a, b) => {
                const numA = parseInt(a.replace("Day ", "")) || 999;
                const numB = parseInt(b.replace("Day ", "")) || 999;
                return numA - numB;
            });
            const values = days.map(d => data.daily_breakdown[d]);
            const avgPerDay = data.per_day_average || 0;

            new Chart(this.barRef.el.getContext("2d"), {
                type: "bar",
                data: {
                    labels: days,
                    datasets: [{
                        label: "Daily Cost",
                        data: values,
                        backgroundColor: values.map(v => v > avgPerDay * 1.5 ? "#FF6666" : "#00A699"),
                        borderRadius: 6,
                        borderSkipped: false,
                    }],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => `₹${ctx.parsed.y.toLocaleString("en-IN")}`,
                            },
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: (val) => "₹" + val.toLocaleString("en-IN"),
                                font: { family: "'Inter', sans-serif" },
                            },
                        },
                        x: {
                            ticks: { font: { family: "'Inter', sans-serif" } },
                        },
                    },
                },
            });
        }
    }

    formatCost(val) {
        return "₹" + Number(val || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
    }
}

registry.category("public_components").add("globetrotter.BudgetChart", BudgetChart);
