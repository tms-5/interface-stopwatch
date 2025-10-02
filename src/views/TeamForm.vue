<template>
  <div class='card w-75'>
    <h1>{{ teamName ? 'Editar Time' : 'Novo Time' }}</h1>
    <div class="team-list">
      <InputComponent v-model="localTeamName" label="Nome do time" :readonly="isEdit"  placeholder="Nome do time"/>
      <InputComponent v-model="rawInput" textarea label="Membros do time" placeholder="João; Maria; Lucas"/>
      <InputComponent v-model="optionalRawInput" textarea label="Pessoas opcionais (falarão no final se sobrar tempo)" placeholder="Fulano; Beltrano"/>
        <div class="sound-row">
          <SelectComponent v-model="audioMode" label="Áudio da troca" selected='sound' :options='[
            { value: "sound", label: "Som" },
            { value: "tts", label: "Ler nome (TTS)" }
          ]'></SelectComponent>
        </div>

      <label v-if="audioMode === 'sound'">
        <div class="sound-row">
          <SelectComponent v-model="selectedSound" label="Som de troca" :options='[
            { value: "", label: "Sem som" },
            { value: "tts", label: "Ler nome (TTS)" }
          ]'></SelectComponent>
          <ButtonComponent small secondary @click="previewSound" :disabled="!selectedSound" label='Reproduzir'></ButtonComponent>
          <ButtonComponent small secondary @click="clearSound" label='Sem som'></ButtonComponent>
        </div>
      </label>
    </div>
    <div class="flex-buttons">
      <ButtonComponent secondary @click="cancel" label='Cancelar'></ButtonComponent>
      <ButtonComponent primary @click="saveTeam" label='Salvar'></ButtonComponent>
    </div>
  </div>
</template>
<script>
import InputComponent from '../assets/components/input/input.vue';
import ButtonComponent from '../assets/components/button/button.vue';
import SelectComponent from '../assets/components/select/select.vue';
export default {
  props: ['teamName'],
  components: {
    InputComponent,
    ButtonComponent,
    SelectComponent
  },
  data() {
    return {
      rawInput: '',
      optionalRawInput: '',
      isEdit: false,
      localTeamName: this.teamName || '',
      availableSounds: [],
      selectedSound: 'tts',
      previewAudio: null,
      audioMode: 'sound'
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
        this.audioMode = found.speakNames ? 'tts' : 'sound';
      }
    }
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
          teams[index].sound = this.audioMode === 'sound' ? (this.selectedSound || '') : '';
          teams[index].speakNames = this.audioMode === 'tts';
        }
      } else {
        teams.push({
          name: this.localTeamName,
          members,
          optionalMembers,
          sound: this.audioMode === 'sound' ? (this.selectedSound || '') : '',
          speakNames: this.audioMode === 'tts'
        });
      }

      localStorage.setItem('agileTeams', JSON.stringify(teams));
      this.$router.push('/');
    },
    cancel() {
      this.$router.push('/');
    },
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