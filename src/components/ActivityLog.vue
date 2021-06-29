<template>
    <div>
        <h2>Activity Log</h2>
        <ul>
            <li v-for="(x,act) in log" :key="act">
                {{`${x.date} : ${x.update}`}}
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { FirebaseFirestore, QuerySnapshot, QueryDocumentSnapshot } from "@firebase/firestore-types";

@Component
export default class ActivityLog extends Vue {
    readonly $appDB!: FirebaseFirestore;

    private log: any[] = [];

    mounted(): void {
        this.$appDB
        .collection('users/me/activityLog')
        .orderBy('date')
        .onSnapshot((qs: QuerySnapshot) => {
            this.log.splice(0);
            
            qs.forEach((qds: QueryDocumentSnapshot) => {
            if(qds.exists){
                const activityData = qds.data();
                console.log(activityData)
                this.log.push({
                date: activityData.date.toDate(),
                update: activityData.update
                })
            }
            })
        })
    }
}
</script>

<style scoped>
ul {
    text-align: left;
}
</style>