<template>
    <div>  
        <h2>World Statistics</h2>
        <button @click="byCountry()">Sort by country (A-Z)</button>
        <button @click="byCases()">Sort by total cases (desc.)</button>
        <button @click="byRecovery()">Sort by percentage of recovery (asc.)</button>
        <section>
            <table>
                <thead>
                    <tr>
                        <th>Country</th>
                        <th>Total<br>Cases</th>
                        <th>Percentage of<br>Recovery</th>
                        <th>Percentage of<br>Death</th>
                    </tr>
                </thead>
                <tr v-for="(a,country) in allCountries" :key="country" v-bind:class="`${colorCodeRows(a)}`">
                    <td>{{a.name}}</td>
                    <td class="right">{{a.total_cases}}</td>
                    <td class="center">{{a.recovery_ratio.toFixed(4) * 100}}%</td>
                    <td class="center">{{a.death_ratio.toFixed(4) * 100}}%</td>
                </tr>
            </table>
        </section>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import axios, { AxiosResponse } from 'axios';
import { FirebaseFirestore } from "@firebase/firestore-types";

@Component
export default class WorldStats extends Vue{
    readonly $appDB!: FirebaseFirestore;
    
    private allCountries: any[] = [];

    colorCodeRows(row: any) {
        if (row.recovery_ratio >= 0.86) {
            return 'better';
        } else if (row.recovery_ratio <= 0.4) {
            return 'severe';
        } else {
            return 'moderate';
        }
    }

    showCountries() {
        let url = 'https://coronavirus-map.p.rapidapi.com/v1/summary/latest';
        axios
            .get(url, {
            headers: {
                'x-rapidapi-key': '931d9b8699msh29048597dd34220p154740jsn5430bcc54bb6',
                'x-rapidapi-host': 'coronavirus-map.p.rapidapi.com'
            }
            })
            .then((r:AxiosResponse) => r.data)
            .then((worldData: any) => {
            let arrayData = worldData.data.regions;
            this.allCountries = arrayData;
            this.allCountries = Object.values(arrayData).map((country: any) => {
                return {
                    name: country.name,
                    total_cases: country.total_cases,
                    recovery_ratio: country.recovery_ratio,
                    death_ratio: country.death_ratio
                }
            });
            }).catch((err: any) => {
                console.log(`Cannot load countries. ${err}.`);
        });
    }

    byCountry() {
        try {
            this.allCountries = this.allCountries.sort((a, b) => {
            if (a['name'] > b['name']) {
                return 1;
            } else {
                return -1;
            }
            });
            this.updateLog("User sorted table data by country");
        } catch(err: any) {
            alert(`Cannot sort table by country. ${err}.`);            
        }
    }

    byCases() {
        try {
            this.allCountries = this.allCountries.sort((a, b) => {
            if (a['total_cases'] < b['total_cases']) {
                return 1;
            } else {
                return -1;
            }
        })
            this.updateLog("User sorted table data by cases");   
        } catch (err: any) {
            alert(`Cannot sort table by cases. ${err}.`);  
        }
    }


    byRecovery() {
        try {
            this.allCountries = this.allCountries.sort((a, b) => {
            if (a['recovery_ratio'] > b['recovery_ratio']) {
                return 1;
            } else {
                return -1;
            }
        })
            this.updateLog("User sorted table data by recovery ratio");
        } catch (err: any) {
            alert(`Cannot sort table by recovery ratio. ${err}.`);
        }
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
        this.showCountries();
    }
}
</script>

<style scoped>
.severe {
    background-color: rgb(248, 0, 0);
    color: white;
}
.better {
    background-color: rgb(0, 255, 0);
}
.moderate {
    background-color: yellow;
}
.left {
  text-align: left;
}
.right {
  text-align: right;
}
.center {
  text-align: center;
}
table {
  border: 2px solid black;
}
th {
  border-bottom: 1px solid black;
  padding: 0px 20px;
}
</style>