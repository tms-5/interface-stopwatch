<template>
  <div>
    <h1>{{ teamName ? 'Editar Time' : 'Novo Time' }}</h1>
    <div class="team-list">
      <label>
        Nome do time
        <input v-model="localTeamName" type="text" placeholder="Nome do time" :readonly="isEdit" />
      </label>
      <label>
        Membros do time
        <textarea v-model="rawInput" placeholder="João; Maria; Lucas"></textarea>
      </label>
      <label>
        Pessoas opcionais (falarão no final se sobrar tempo)
        <textarea v-model="optionalRawInput" placeholder="Fulano; Beltrano"></textarea>
      </label>
    </div>
    <div class="flex-buttons">
      <button secondary @click="cancel">Cancelar</button>
      <button primary @click="saveTeam">Salvar</button>
    </div>
  </div>
</template>
<script>
export default {
  props: ['teamName'],
  data() {
    return {
      rawInput: '',
      optionalRawInput: '',
      isEdit: false,
      localTeamName: this.teamName || ''
    }
  },
  mounted() {
    if (this.teamName) {
      const teams = JSON.parse(localStorage.getItem('agileTeams') || '[]');
      const found = teams.find(t => t.name === this.teamName);
      if (found) {
        this.rawInput = found.members.join('; ');
        this.optionalRawInput = (found.optionalMembers || []).join('; ');
        this.isEdit = true;
      }
    }
  },
  methods: {
    saveTeam() {
      const members = this.rawInput.split(';').map(x => x.trim()).filter(Boolean);
      const optionalMembers = this.optionalRawInput.split(';').map(x => x.trim()).filter(Boolean);
      const teams = JSON.parse(localStorage.getItem('agileTeams') || '[]');

      if (this.isEdit) {
        const index = teams.findIndex(t => t.name === this.teamName);
        if (index !== -1) {
          teams[index].members = members;
          teams[index].optionalMembers = optionalMembers;
        }
      } else {
        teams.push({ name: this.localTeamName, members, optionalMembers });
      }

      localStorage.setItem('agileTeams', JSON.stringify(teams));
      this.$router.push('/');
    },
    cancel() {
      this.$router.push('/');
    }
  },
}
</script>
<style scoped>
.team-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: left;
}
</style>