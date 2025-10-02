<template>
  <ButtonComponent secondary @click="goBack" class="back-button">Voltar para os times</ButtonComponent>
  <div class="h-100 w-100">
    <DailyScreen :members="team.members" :start="start" :end="end" :team-name="team.name"
      :optionalMembers="team.optionalMembers" :sound="team.sound" :speak-names="team.speakNames" />
  </div>
</template>
<script>
import DailyScreen from '../components/DailyScreen/DailyScreen.vue'
import ButtonComponent from '../assets/components/button/button.vue'
export default {
  components: { DailyScreen, ButtonComponent },
  props: ['teamName', 'start', 'end', 'guests'],
  data() {
    return {
      team: { name: '', members: [], optionalMembers: [], sound: '', speakNames: false }
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
<style scoped>
.back-button {
  position: fixed;
  top: 13px;
  right: 8px;
  z-index: 1060;
  cursor: pointer;
}
</style>