<template>
  <div id="top">
    <div id="header">
      <h1>COVID-19 Dashboard by Felix Clinthorne</h1>
      <p>I confirm that the work submitted for grading is solely mine.  While working on this take-home exam, 
        I neither received nor gave any assistance from/to other human beings.  
        I understand that violating this academic honesty may seriously impact my grade for this class.</p>
    </div>
    <div id="dropdown-container">
      <label for="countries" id="drop-label">Select a country </label>
      <select name="countries" id="dropdown" v-model="userSearch">
        <option v-for="(c,pos) in allCountries" :value="c.name" :key="pos" @click="searchItem(); updateCountry(); showCountries()">{{c.name}}</option>
      </select>
    </div>
    <div id="grid-container">
      <section>
        <WorldStats v-bind:allCountries="allCountries" />
      </section>
      <section>
        <Country v-bind:currentCountry="userSearch" />
      </section>
      <section>
        <ActivityLog />
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import axios, { AxiosResponse } from 'axios';
import { FirebaseFirestore } from "@firebase/firestore-types";
import WorldStats from "./components/WorldStats.vue";
import Country from "./components/Country.vue";
import ActivityLog from "./components/ActivityLog.vue";

@Component ({
  components: {
    WorldStats,
    Country,
    ActivityLog
  }
})
export default class App extends Vue {
    readonly $appDB!: FirebaseFirestore;

    private isSelected: boolean;
    private allCountries: any[] = [];
    private userSearch = "";

    searchItem() {
      let url = 'https://coronavirus-map.p.rapidapi.com/v1/summary/region';
      let key = '931d9b8699msh29048597dd34220p154740jsn5430bcc54bb6';
      let host = 'coronavirus-map.p.rapidapi.com';
      console.log(url);
      axios
        .get(url, {
          params: {
            region: this.userSearch
            },
          headers: {
            'x-rapidapi-key': key,
            'x-rapidapi-host': host
          }
        })
        .then((r: AxiosResponse) => r.data)
        .then((worldData) => {
          let summary: any;
          summary = worldData.data.summary;
          console.log(summary);
          this.$appDB
            .collection("users/me/data")
            .add({test: summary});
        }).catch((err: any) => {
            console.log(`Cannot search. ${err}.`);
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

    updateCountry() {
      this.updateLog(`User selected ${this.userSearch}`);
      console.log(`Country: ${this.userSearch}`);
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
            let countryList;
            let selection = this.userSearch;
            countryList = worldData.data.regions;
            this.allCountries = countryList;
          }).catch((err: any) => {
              console.log(`Cannot show countries. ${err}.`);
            });
    }

    mounted(): void {
      this.showCountries();
      WorldStats;
    }
}
</script>

<style>
#top {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
#worldStats {
  border: 2px solid black;
}
#grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
</style>