<template>
  <div>
    <label v-if='!hasStarted'>
      Tempo da daily (minutos):
      <input type="number" id="minutesFromNow" name="minutesFromNow" v-model.number="minutesFromNow"
        @change="updateEndTime" />
    </label>
  </div>
  <div v-if="currentMember">
    <h2>Membro: {{ currentMember }}</h2>
    <div class="countdown-wrapper">
      <svg class="countdown-ring" viewBox="0 0 100 100">
        <circle class="countdown-bg" cx="50" cy="50" r="45" />
        <circle class="countdown-fill" cx="50" cy="50" r="45" />
      </svg>
      <div class="countdown-text">{{ formatTime(timer) }}</div>
    </div>
    <div class='buttons-control'>
      <button secondary @click="toggleStopwatch">{{ isRunning ? 'Parar tempo' : 'Retomar tempo' }}</button>
      <button secondary @click="skipMember">Pular membro</button>
      <button primary @click="nextMember">Próximo membro</button>
    </div>
  </div>
  <div v-else>
    <h2>Todos os membros falaram!</h2>
  </div>
  <div v-if="!hasStarted" class='mt-1 mb-1'>
    <button primary @click="startDaily">Iniciar Daily</button>
  </div>
  <ul>
    <li v-for="(member, index) in members" :key="member" :class="{ spoken: spokenMembers.includes(member) }">
      <input type="checkbox" :id="'member-' + index" :checked="spokenMembers.includes(member)"
        @change="toggleAvailability(member)" />
      <label :for="'member-' + index">{{ member }}</label>
    </li>
  </ul>
  <div class='update'>
    <h3>Nos atualize:</h3>
    <ul>
      <li>O que fiz ontem?</li>
      <li>O que farei hoje?</li>
      <li>Algum impedimento?</li>
    </ul>
  </div>
  <div>
    <div>
      <h3>Tempo atual: {{ currentTime }}</h3>
      <h3>Tempo restante para daily terminar: {{ this.formatTime(timeLeft) }}</h3>
      <button secondary @click="refreshDaily">Reiniciar Daily</button>
    </div>
  </div>
  <div :class="{ 'blinking-red': isBlinking }" class='background'></div>
</template>

<script>
export default {
  props: ['members', 'start', 'end'],
  data() {
    return {
      currentMember: null,
      timer: 0,
      isRunning: false,
      interval: null,
      currentTime: "",
      hasStarted: false,
      spokenMembers: [],
      minutesFromNow: 15,
      timeLeft: 0,
      endTime: null,
      startTime: null,
      currentMemberMaxTime: 0
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
      this.updateCurrentTime();
      this.currentTimeInterval = setInterval(() => this.updateCurrentTime(), 1000);
      setTimeout(() => this.nextMember(), 50);
    }
  },
  computed: {
    timePerMember() {
      const remaining = this.members.filter(m => !this.spokenMembers.includes(m));
      return remaining.length > 0 ? Math.floor(this.timeLeft / remaining.length) : 0;
    },
    isBlinking() {
      return this.currentMember && this.timer > 0 && this.timer <= this.timePerMember * 0.3;
    },
  },
  methods: {
    formatTime(seconds) {
      if (isNaN(seconds) || seconds < 0) return "00:00";
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    },
    startDaily() {
      this.hasStarted = true;
      const now = new Date();
      this.startTime = now;
      const end = new Date(now.getTime() + this.minutesFromNow * 60000);
      this.endTime = end;
      this.updateCurrentTime();
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
            this.nextMember();
          }
        }, 1000);
      }
    },
    nextMember() {
      if (this.isRunning) {
        clearInterval(this.interval);
        this.isRunning = false;
      }

      const availableMembers = this.members.filter(
        (member) => !this.spokenMembers.includes(member)
      );

      if (availableMembers.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableMembers.length);
        const selected = availableMembers[randomIndex];

        this.currentMember = selected;

        const now = new Date();
        const totalRemainingSeconds = this.endTime
          ? Math.max(0, Math.floor((this.endTime - now) / 1000))
          : 0;
        const remainingCount = this.members.length - this.spokenMembers.length;
        this.timer = remainingCount > 0
          ? Math.floor(totalRemainingSeconds / remainingCount)
          : 0;
        this.currentMemberMaxTime = this.timer;
        this.spokenMembers.push(selected);
      } else {
        this.currentMember = null;
        this.timer = 0;
        this.currentMemberMaxTime = this.timer;
      }

      this.toggleStopwatch();
    },
    toggleAvailability(member) {
      if (this.spokenMembers.includes(member)) {
        this.spokenMembers = this.spokenMembers.filter((m) => m !== member);
      } else {
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
      clearInterval(this.interval);
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
    }
  }
}
</script>
<style scoped>
.buttons-control {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 20px 0;

}

ul {
  list-style: none;
  padding: 0;
  width: 20%;
  margin: auto;
}

@media screen and (max-width: 1000px) {
  ul {
    width: 100%;
  }
}

li {
  margin: 5px 0;
  justify-self: left;
  text-wrap-mode: nowrap;
}

li.spoken {
  text-decoration: line-through;
}

li.unavailable {
  color: gray;
  text-decoration: line-through;
}

input[type="time"] {
  margin-left: 10px;
}

.update {
  margin-top: 20px;
  padding: 10px 10px 20px 10px;
  background-color: #f5f4f7;
  border-radius: 5px;
}

.update ul {
  width: 155px;
}

.background {
  z-index: -1;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
}

.blinking-red {
  animation: blink 1s infinite;
  background-color: red;
}

@keyframes blink {

  0%,
  50% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

.countdown-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  margin: auto;
}

.countdown-ring {
  transform: rotate(-90deg);
  width: 100px;
  height: 100px;
}

.countdown-bg,
.countdown-fill {
  fill: none;
  stroke-width: 10;
  cx: 50;
  cy: 50;
  r: 45;
}

.countdown-bg {
  stroke: #eee;
}

.countdown-fill {
  stroke: #97cca1;
  stroke-linecap: round;
  stroke-dasharray: 282.6;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 1s linear;
}

.countdown-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.2rem;
  font-weight: bold;
}

.mt-1 {
  margin-top: 1rem;
}

.mb-1 {
  margin-bottom: 1rem;
}
</style>