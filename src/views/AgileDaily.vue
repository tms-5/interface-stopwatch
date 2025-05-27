<template>
  <button secondary @click="goBack" class="back-button">Voltar para os times</button>
  <div>
    <h1>{{ teamName }}</h1>
    <DailyScreen :members="team.members" :start="start" :end="end" />
  </div>
</template>
<script>
import DailyScreen from '../components/DailyScreen.vue'

export default {
  components: { DailyScreen },
  props: ['teamName', 'start', 'end', 'guests'],
  data() {
    return {
      team: { name: '', members: [] }
    }
  },
  mounted() {
    if (this.teamName) {
      const teams = JSON.parse(localStorage.getItem('agileTeams') || '[]');
      const found = teams.find(t => t.name === this.teamName);
      if (found) this.team = found;
    } else if (this.guests) {
      const names = decodeURIComponent(this.guests).split(';').map(n => n.trim()).filter(Boolean);
      this.team = { name: 'Convidados', members: names };
    }
  },
  methods: {
    goBack() {
      this.$router.push('/');
    }
  }
}
</script>