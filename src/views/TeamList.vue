<template>
  <div class='card w-75'>
    <h1>Seus Times</h1>
    <ul>
      <li v-for="team in teams" :key="team.name">
        <router-link :to="`/daily/${team.name}`">{{ team.name }}</router-link>
        <div class='flex-buttons gap-2'>
          <button small secondary @click="editTeam(team.name)">Editar</button>
          <button small secondary @click="confirmDelete(team.name)">Excluir</button>
        </div>
      </li>
    </ul>
    <button primary><router-link to="/create">+ Novo Time</router-link></button>
  </div>
</template>
<script>
export default {
  data() {
    return {
      teams: []
    }
  },
  methods: {
    loadTeams() {
      this.teams = JSON.parse(localStorage.getItem('agileTeams') || '[]');
    },
    editTeam(name) {
      this.$router.push(`/edit/${name}`);
    },
    confirmDelete(name) {
      if (confirm(`Deseja realmente excluir o time "${name}"?`)) {
        this.deleteTeam(name);
      }
    },
    deleteTeam(name) {
      const teams = JSON.parse(localStorage.getItem('agileTeams') || '[]');
      const updated = teams.filter(t => t.name !== name);
      localStorage.setItem('agileTeams', JSON.stringify(updated));
      this.loadTeams();
    }
  },
  mounted() {
    this.loadTeams();
  },
}
</script>
<style scoped>
button a {
  text-decoration: none;
  color: white;
}

ul {
  list-style: num;
  padding: 0;
}

li {
  margin: 16px 0;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

</style>