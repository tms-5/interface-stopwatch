<template>
  <button secondary @click="goBack" class="back-button">Voltar para os times</button>
    <div>
      <h1>{{ teamName }}</h1>
      <DailyScreen :members="team.members" />
    </div>
  </template>
  <script>
  import DailyScreen from '../components/DailyScreen.vue'
  
  export default {
    components: { DailyScreen },
    props: ['teamName'],
    data() {
      return {
        team: { name: '', members: [] }
      }
    },
    mounted() {
      const teams = JSON.parse(localStorage.getItem('agileTeams') || '[]');
      const found = teams.find(t => t.name === this.teamName);
      if (found) this.team = found;
    },
    methods: {
    goBack() {
      this.$router.push('/');
    }
  }
  }
  </script>