<template>
    <div>
        <h2 id="trend">Trend in {{currentCountry}} (click one to see table)</h2>
        <button @click="loadData('year')">Get yearly data</button>
        <button @click="loadData('month')">Get monthly data</button>
        <button @click="loadData('week')">Get weekly data</button>
        <section>
            <table>
                <thead>
                    <tr v-if="dataRequested">
                        <th>Date</th>
                        <th>Critical</th>
                        <th>Deaths</th>
                        <th>Death Ratio</th>
                        <th>Recovered</th>
                        <th>Recovery Ratio</th>
                        <th>Total Cases</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(z,info) in countryInfo" :key="info">
                        <td>{{z.date}}</td>
                        <td>{{z.critical}}</td>
                        <td>{{z.deaths}}</td>
                        <td>{{z.death_ratio.toFixed(4) * 100}}%</td>
                        <td>{{z.recovered}}</td>
                        <td>{{z.recovery_ratio.toFixed(4) * 100}}%</td>
                        <td>{{z.total_cases}}</td>
                    </tr>
                </tbody>
            </table>
            <div id="apex-chart"></div>
        </section>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import axios, { AxiosResponse } from 'axios';
import ApexCharts from "apexcharts";
import { FirebaseFirestore } from "@firebase/firestore-types";

@Component
export default class Country extends Vue {
    readonly $appDB!: FirebaseFirestore;

    private dataRequested = false;

    @Prop() private currentCountry!: string;

    private countryInfo: any[] = [];

    loadData(timeframe: string) {
        let url = `https://coronavirus-map.p.rapidapi.com/v1/spots/${timeframe}`;
        axios
            .get(url, {
            params: {
                region: this.currentCountry
            },
            headers: {
                'x-rapidapi-key': '931d9b8699msh29048597dd34220p154740jsn5430bcc54bb6',
                'x-rapidapi-host': 'coronavirus-map.p.rapidapi.com'
            }
            })
            .then((r:AxiosResponse) => r.data)
            .then((worldData: any) => {
                this.countryInfo = worldData.data;
                this.dataRequested = true;
                this.updateLog(`User selected ${timeframe}ly data for ${this.currentCountry}`);
                document.getElementById("trend").innerHTML = `COVID-19: ${timeframe}ly trend in ${this.currentCountry}`;
                try {
                    // Do Apex line chart THIS way, according to the Apex docs
                    const options = {
                        chart: {
                            id: 'apex-chart',
                            type: 'line'
                        },
                        xaxis: {
                            x: Object.keys(worldData.data)
                        },
                        series: [{
                            title: `Total ${this.currentCountry} cases (${timeframe}ly)`,
                            cases: Object.values(worldData.data).map((country: any) => country.total_cases)
                        }]
                    }
                    const apexLineChart = new ApexCharts(document.querySelector("apex-chart"), options);
                    apexLineChart.render();
                } catch (err: any) {
                    alert(`Cannot load apex chart data. ${err}.`);
                }
            }).catch((err: any) => {
                alert(`Cannot load ${timeframe}ly data. ${err}.`);
        });
    }

    searchItem() {
        let url = 'https://coronavirus-map.p.rapidapi.com/v1/summary/region';

        console.log(url);
        axios
        .get(url, {
            params: {
            region: this.currentCountry
            },
            headers: {
            'x-rapidapi-key': '931d9b8699msh29048597dd34220p154740jsn5430bcc54bb6',
            'x-rapidapi-host': 'coronavirus-map.p.rapidapi.com'
            }
        })
        .then((r: AxiosResponse) => r.data)
        .then((worldData) => {
            let currentCountry;
            currentCountry = worldData.data.regions;
            this.countryInfo = currentCountry;
            this.$appDB
            .collection("users/me/data")
            .add({test: currentCountry});
        }).catch((err: any) => {
            alert(`Cannot search. ${err}.`);
            });
    }

    updateLog(update: any) {
        try {
            this.$appDB
            .collection('users/me/activityLog')
            .add({
                date: new Date(),
                update: update
            })
        } catch (err: any) {
            alert(`Error while updating user activity log. ${err}.`);
        }
    }

    mounted(): void {
        console.log("Country");
    }
}

</script>

<style scoped>
tbody > tr:nth-child(even) {
    background-color: rgb(100, 193, 255);
}
tbody > tr:nth-child(odd) {
    background-color: rgb(250, 195, 92);
}
</style>