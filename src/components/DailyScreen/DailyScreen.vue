<template>
  <div class="d-flex w-100 h-100 justify-center align-items-center g-2" id="daily-screen">
    <div class="col w-25 align-start card">
      <MemberList :teamName="teamName" :members="localMembers" :spokenMembers="spokenMembers"
        :optionalMembers="localOptionalMembers" :spokenOptional="spokenOptional" @move-to-required="moveToRequired"
        @toggle-availability="toggleAvailability" />
    </div>
    <div class="col w-50 align-center">

      <div class="card h-100 align-content-center">
        <div v-if="currentMember" class="d-grid g-2 justify-items-center">
          <CurrentMember :currentMember="currentMember" :timer="timer" :currentMemberMaxTime="currentMemberMaxTime"
            :isRunning="!!isRunning" :timePerMember="timePerMember" :isBlinking="!!blinkClass" @skip-member="skipMember"
            @next-member="nextMember" @toggle-stopwatch="toggleStopwatch" @reset-daily="resetDaily" />
        </div>

        <div v-else-if="!currentMember && hasEnded" class="d-grid g-2 justify-items-center">
          <h2>Todos os membros falaram!</h2>
          <button secondary @click="resetDaily">Reiniciar Daily</button>
        </div>

        <div v-else class="d-grid g-2 justify-items-center">
          <label>
            Tempo da daily (minutos):
            <input type="number" id="minutesFromNow" name="minutesFromNow" v-model.number="minutesFromNow"
              @change="updateEndTime" />
          </label>
          <button primary @click="startDaily">Iniciar Daily</button>
        </div>
      </div>
    </div>
    <InfoDaily :currentTime="currentTime" :timeLeft="timeLeft" />
  </div>
  <div :class="['background', blinkClass]"></div>
</template>

<script>
import CurrentMember from '../CurrentMember/CurrentMember.vue';
import InfoDaily from '../InfoDaily/InfoDaily.vue';
import MemberList from '../MemberList/MemberList.vue';

export default {
  props: {
    teamName: String,
    start: String,
    end: String,
    members: {
      type: Array,
      default: () => []
    },
    optionalMembers: {
      type: Array,
      default: () => []
    }
  },
  name: 'DailyScreen',
  components: {
    MemberList,
    CurrentMember,
    InfoDaily
  },
  data() {
    return {
      currentMember: null,
      timer: 0,
      isRunning: false,
      interval: null,
      currentTime: "",
      hasStarted: false,
      hasEnded: false,
      spokenMembers: [],
      spokenOptional: [],
      remainingOptional: [],
      minutesFromNow: 15,
      timeLeft: 0,
      endTime: null,
      startTime: null,
      currentMemberMaxTime: 0,
      isOptionalPhase: false,
      localMembers: this.$props.members || [],
      localOptionalMembers: this.$props.optionalMembers || [],
    }
  },
  mounted() {
    if (this.start && this.end) {
      this.hasStarted = true;
      const now = new Date();
      this.startTime = now;
      const start = new Date(Date.parse(this.start));
      const end = new Date(Date.parse(this.end));
      const diff = end.getTime() - start.getTime();
      this.endTime = new Date(now.getTime() + diff);
      setTimeout(() => this.nextMember(), 50);

    } this.updateCurrentTime();
    this.currentTimeInterval = setInterval(() => this.updateCurrentTime(), 1000);
  },
  computed: {
    timePerMember() {
      const obrigatoriosRestantes = this.localMembers.filter(m => !this.spokenMembers.includes(m)).length;
      const temOpcionais = (this.localOptionalMembers || []).length > 0;
      const divisor = obrigatoriosRestantes + (temOpcionais ? 1 : 0);

      return divisor > 0 ? Math.floor(this.timeLeft / divisor) : 0;
    },

    blinkClass() {
      if (this.currentMember && this.timer > 0 && this.timer <= 10) {
        return 'blinking-very-fast';
      }
      if (this.currentMember && this.timer > 0 && this.timer <= 30) {
        return 'blinking-slow';
      }
      return '';
    },
  },
  methods: {
    startDaily() {
      this.hasStarted = true;
      const now = new Date();
      this.startTime = now;
      const end = new Date(now.getTime() + this.minutesFromNow * 60000);
      this.endTime = end;
      this.updateCurrentTime();
      this.isRunning = true;
      setInterval(() => this.updateCurrentTime(), 1000);
      setTimeout(() => this.nextMember(), 50);
    },

    updateCurrentTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      this.timeLeft = this.endTime ? Math.max(0, Math.floor((this.endTime.getTime() - now.getTime()) / 1000)) : 0;
    },

    toggleStopwatch() {
      if (this.isRunning) {
        clearInterval(this.interval);
        this.isRunning = false;
      } else {
        this.isRunning = true;
        this.interval = setInterval(() => {
          if (this.timer > 0) {
            this.timer--;
          } else {
            if (this.isOptionalPhase && this.currentMember) {
              this.spokenOptional.push(this.currentMember);
            }
            this.nextMember();
          }
        }, 1000);
      }
    },

    nextMember() {
      if (this.isRunning) {
        clearInterval(this.interval);
        this.isRunning = false;
      } else {
        return;
      }

      let availableMembers;

      if (this.isOptionalPhase) {
        availableMembers = this.remainingOptional;
      } else {
        availableMembers = this.localMembers.filter(m => !this.spokenMembers.includes(m));
      }


      if (availableMembers.length > 0) {
        const selected = availableMembers[Math.floor(Math.random() * availableMembers.length)];



        this.currentMember = selected;

        if (this.isOptionalPhase) {
          this.timer = Math.floor(this.timePerMember / this.remainingOptional.length);
          this.currentMemberMaxTime = this.timer;
          this.remainingOptional.shift();
          this.spokenOptional.push(selected);
        } else {
          const remainingCount = availableMembers.length;
          this.timer = remainingCount > 0
            ? Math.floor(this.timeLeft / (remainingCount + (this.optionalMembers?.length > 0 ? 1 : 0)))
            : 0;
          this.currentMemberMaxTime = this.timer;
          this.spokenMembers.push(selected);
        }


      } else {
        if (
          this.spokenMembers.length < this.localMembers.length
        ) {
          setTimeout(() => this.nextMember(), 0);
        } else if (
          !this.isOptionalPhase &&
          this.remainingOptional.length > 0
        ) {
          this.isOptionalPhase = true;
          setTimeout(() => this.nextMember(), 0);
        } else {
          this.currentMember = null;
          this.timer = 0;
          this.currentMemberMaxTime = 0;
          this.isRunning = false;
          this.hasEnded = true;
          return;
        }
      }

      this.toggleStopwatch();
    },

    toggleAvailability(member, type) {
      if (type === 'optional') {
        if (this.spokenOptional.includes(member) || this.spokenMembers.includes(member)) {
          this.spokenOptional = this.spokenOptional.filter((m) => m !== member);
        } else {
          this.spokenOptional.push(member);
          this.remainingOptional = this.localOptionalMembers.filter(m => !this.spokenOptional.includes(m));
        }
      } else {
        if (this.spokenMembers.includes(member)) {
          this.spokenMembers = this.spokenMembers.filter((m) => m !== member);
        } else if (!this.localMembers.includes(member)) {
          this.localMembers.push(member);
        }
        this.availableMembers = this.localMembers.filter(m => !this.spokenMembers.includes(m));
        this.spokenMembers.push(member);
      }

      this.updateCurrentTime();

      if (this.currentMember) {
        this.timer = this.timePerMember;
        this.currentMemberMaxTime = this.timer;
      }
    },

    skipMember() {
      if (this.currentMember) {
        this.spokenMembers = this.spokenMembers.filter(m => m !== this.currentMember);
        this.nextMember();
      }
    },

    refreshDaily() {
      this.resetDaily();
    },

    resetDaily() {
      this.currentMember = null;
      this.timer = 0;
      this.currentMemberMaxTime = this.timer;
      this.minutesFromNow = 15;
      this.timeLeft = 0;
      this.isRunning = false;
      this.hasStarted = false;
      this.spokenMembers = [];
      this.spokenOptional = [];
      this.remainingOptional = [];
      clearInterval(this.interval);
    },

    moveToRequired(member, index) {
      const newOptional = this.localOptionalMembers.filter(m => m !== member);
      this.localOptionalMembers = newOptional;

      this.spokenOptional = this.spokenOptional.filter(m => m !== member);

      if (!this.localMembers.includes(member)) {
        this.localMembers.splice(index, 0, member);
      }

      this.remainingOptional = newOptional.filter(m => !this.spokenOptional.includes(m));

      this.updateCurrentTime();
      if (this.currentMember) {
        this.timer = this.timePerMember;
        this.currentMemberMaxTime = this.timer;
      }
    },

  },
  watch: {
    timer(newVal) {
      const circle = document.querySelector('.countdown-fill');
      const radius = 45;
      const circumference = 2 * Math.PI * radius;
      const max = this.currentMemberMaxTime || 1;
      const percent = newVal / max;
      if (circle) {
        circle.style.strokeDashoffset = `${circumference * (1 - percent)}`;
      }
    },
    members: {
      handler(newVal) {
        this.localMembers = [...newVal];
      },
      immediate: true
    },
    optionalMembers: {
      handler(newVal) {
        this.localOptionalMembers = [...newVal];
      },
      immediate: true
    }
  }
}
</script>
<style>
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin: 20px;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: #FFFFFF;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 8px 16px;
  width: 100%;
  box-sizing: border-box;
}

.background {
  z-index: -1;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
}

.background.blinking-slow {
  animation: blink-slow 3s infinite;
  background-color: rgb(255 187 187);
}

.background.blinking-very-fast {
  animation: blink-fast 1.3s infinite;
  background-color: rgb(121, 0, 0);
}

@keyframes blink-slow {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

@keyframes blink-fast {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

@media screen and (max-width: 1000px) {
  #daily-screen {
    flex-direction: column;
    justify-content: flex-start;
  }

  .col {
    width: 100% !important;
  }

  .card {
    width: 90%;
  }

}
</style>