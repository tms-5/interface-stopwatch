<template>
  <div class='card w-75'>
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
      <label>
        Som de troca
        <div class="sound-row">
          <select v-model="selectedSound">
            <option value="">Sem som</option>
            <option v-for="s in availableSounds" :key="s.fileName" :value="s.fileName">{{ s.label }}</option>
          </select>
          <button small secondary @click="previewSound" :disabled="!selectedSound">Reproduzir</button>
          <button small secondary @click="clearSound">Sem som</button>
        </div>
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
      localTeamName: this.teamName || '',
      availableSounds: [],
      selectedSound: '',
      previewAudio: null
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
        this.selectedSound = found.sound || '';
      }
    }

    // Load available sounds from assets at build-time (Vite)
    try {
      const ctx = require.context('../assets/sounds', false, /\.(mp3|wav|ogg)$/);
      this.availableSounds = ctx.keys()
        .map((key) => {
          const fileName = key.replace('./', '');
          const url = ctx(key);
          return { fileName, url, label: fileName };
        })
        .sort((a, b) => a.fileName.localeCompare(b.fileName));
    } catch (_) { void 0; }
  },
  methods: {
    previewSound() {
      if (!this.selectedSound) return;
      try {
        const found = this.availableSounds.find(s => s.fileName === this.selectedSound);
        const url = found ? found.url : '';
        if (!url) return;
        if (this.previewAudio) {
          this.previewAudio.pause();
          this.previewAudio = null;
        }
        this.previewAudio = new Audio(url);
        this.previewAudio.volume = 0.9;
        this.previewAudio.play().catch(() => undefined);
      } catch (_) { void 0; }
    },
    clearSound() {
      this.selectedSound = '';
      if (this.previewAudio) {
        try { this.previewAudio.pause(); } catch (_) { void 0; }
        this.previewAudio = null;
      }
    },
    saveTeam() {
      const members = this.rawInput.split(';').map(x => x.trim()).filter(Boolean);
      const optionalMembers = this.optionalRawInput.split(';').map(x => x.trim()).filter(Boolean);
      const teams = JSON.parse(localStorage.getItem('agileTeams') || '[]');

      if (this.isEdit) {
        const index = teams.findIndex(t => t.name === this.teamName);
        if (index !== -1) {
          teams[index].members = members;
          teams[index].optionalMembers = optionalMembers;
          teams[index].sound = this.selectedSound || '';
        }
      } else {
        teams.push({ name: this.localTeamName, members, optionalMembers, sound: this.selectedSound || '' });
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

.sound-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>