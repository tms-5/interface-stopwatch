<template>
  <h1>Daily Standup Stopwatch</h1>
  <div v-if="!currentDaily">
    <h2>Select a Daily:</h2>
    <div class='buttons-control'>
      <button secondary @click="selectDaily('DS Daily')">DS Daily</button>
      <button secondary @click="selectDaily('Interface Daily')">Interface Daily</button>
    </div>
  </div>
  <div v-else>
    <h2>{{ currentDaily.name }}</h2>
    <div>
      <label v-if='!hasStarted'>
        Minutes from now:
        <input
          type="number"
          id="minutesFromNow"
          name="minutesFromNow"
          v-model.number="minutesFromNow"
          @change="updateEndTime"
        />
      </label>
    </div>
    <div v-if="!hasStarted" class='mt-1 mb-1'>
      <button primary @click="startDaily">Start Daily</button>
    </div>
    <div v-else>
      <div v-if="currentMember">
        <h2>Current: {{ currentMember }}</h2>
        <div class="countdown-wrapper">
          <svg class="countdown-ring" viewBox="0 0 100 100">
            <circle class="countdown-bg" cx="50" cy="50" r="45" />
            <circle class="countdown-fill" cx="50" cy="50" r="45" />
          </svg>
          <div class="countdown-text">{{ formatTime(timer) }}</div>
        </div>
        <div class='buttons-control'>
          <button secondary @click="toggleStopwatch">{{ isRunning ? 'Pause' : 'Start' }}</button>
          <button secondary @click="skipMember">Skip</button>
          <button primary @click="nextMember">Next</button>
        </div>
      </div>
      <div v-else>
        <h2>All members have had their turn!</h2>
      </div>
    </div>
    <ul>
      <li v-for="(member, index) in currentDaily.members" :key="index"
        :class="{ spoken: spokenMembers.includes(member), unavailable: spokenMembers.includes(member) }">
        <input
          type="checkbox"
          :id="'member-' + index"
          :checked="spokenMembers.includes(member)"
          @change="toggleAvailability(member)"
        />
        <label :for="'member-' + index">{{ member }}</label>
      </li>
    </ul>

    <div class='update'>
      <h3>Update us:</h3>
      <ul>
        <li>O que fiz ontem?</li>
        <li>O que farei hoje?</li>
        <li>Algum impedimento?</li>
      </ul>
    </div>
    <div>
      <h3>Current Time: {{ currentTime }}</h3>
      <h3>Time Left for Daily ends: {{ formatTime(timeLeftForDaily) }}</h3>

      <button secondary @click="switchDaily" class='mt-1'>
        Switch to {{ currentDaily.name === 'DS Daily' ? 'Interface Daily' : 'DS Daily' }}
      </button>
    </div>
  </div>
  <div :class="{ 'blinking-red': isBlinking }" class='background'></div>
</template>

<script>
export default {
  data() {
    return {
      dailies: {
        "DS Daily": {
          name: "DS Daily",
          members: ["Thami", "Lahana", "Felipe", "Leo", "Vitor"],
          startTime: "09:30",
          endTime: "09:45",
          durationMinutes: 15,
        },
        "Interface Daily": {
          name: "Interface Daily",
          members: ["Marlon", "Bruno", "Vitor", "Well", "Benjamin", "Lahana", "Thami", "Leo"],
          startTime: "09:45",
          endTime: "10:00",
          durationMinutes: 15,
        },
      },
      currentDaily: null, // Initialize as null
      currentMember: null,
      timer: 0, // Timer for each member
      isRunning: false,
      interval: null,
      currentTime: "",
      hasStarted: false, // Flag to track if the daily has started
      spokenMembers: [], // Members who are unavailable
      minutesFromNow: 15,
    };
  },
  computed: {
    timeLeftForDaily() {
      if (!this.currentDaily) return 0;
      const now = new Date();
      const [endHour, endMinute] = this.currentDaily.endTime.split(":").map(Number);
      const dailyEnd = new Date();
      dailyEnd.setHours(endHour, endMinute, 0);
      return Math.max(0, Math.floor((dailyEnd - now) / 1000));
    },
    timePerMember() {
      if (!this.currentDaily) return 0;
      const availableMembers = this.currentDaily.members.filter(
        (member) => !this.spokenMembers.includes(member)
      );
      return availableMembers.length > 0
        ? Math.floor(this.timeLeftForDaily / availableMembers.length)
        : 0;
    },
    isBlinking() {
      return this.currentMember && this.timer > 0 && this.timer <= this.timePerMember * 0.3;
    },
  },

  methods: {
    formatTime(seconds) {
      if (isNaN(seconds) || seconds < 0) {
        return "00:00";
      }
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    },
    calculateTotalDailyTime() {
      if (!this.currentDaily) return 0;
      const now = new Date();
      const [endHour, endMinute] = this.currentDaily.endTime.split(":").map(Number);

      const endTime = new Date();
      endTime.setHours(endHour, endMinute, 0);

      return Math.max(0, Math.floor((endTime - now) / 1000)); // Total time in seconds
    },
    selectDaily(dailyName) {
      this.currentDaily = this.dailies[dailyName];
      this.minutesFromNow = 15;
      this.updateEndTime();
    },
    startDaily() {
      this.hasStarted = true;
      const now = new Date();

      const [startHour, startMinute] = this.currentDaily.startTime.split(":").map(Number);
      const [endHour, endMinute] = this.currentDaily.endTime.split(":").map(Number);
      const start = new Date();
      const end = new Date();
      start.setHours(startHour, startMinute, 0);
      end.setHours(endHour, endMinute, 0);

      if (now < start || now > end) {
        const newEnd = new Date(now.getTime() + this.currentDaily.durationMinutes * 60000);
        const hh = String(newEnd.getHours()).padStart(2, "0");
        const mm = String(newEnd.getMinutes()).padStart(2, "0");
        this.currentDaily.endTime = `${hh}:${mm}`;
      }

      this.updateCurrentTime();
      this.nextMember();
    },
    switchDaily() {
      if (this.currentDaily.name === "DS Daily") {
        this.currentDaily = this.dailies["Interface Daily"];
      } else {
        this.currentDaily = this.dailies["DS Daily"];
      }
      this.resetDaily();
    },
    resetDaily() {
      this.currentMember = null;
      this.timer = 0;
      this.isRunning = false;
      this.hasStarted = false;
      this.spokenMembers = [];
      this.spokenMembers = [];
      clearInterval(this.interval);
    },
    updateCurrentTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    toggleStopwatch() {
      if (this.isRunning) {
        clearInterval(this.interval);
        this.isRunning = false;
        this.isBlinking = false;
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
      const availableMembers = this.currentDaily.members.filter(
        (member) =>
          !this.spokenMembers.includes(member) &&
          !this.spokenMembers.includes(member)
      );
      if (availableMembers.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableMembers.length);
        this.currentMember = availableMembers[randomIndex];
        this.spokenMembers.push(this.currentMember); // Mark the member as spoken
        this.timer = this.timePerMember; // Set timer for the next member
      } else {
        this.currentMember = null;
        this.timer = 0; // No more members, stop the timer
      }
      this.toggleStopwatch();
    },
    toggleAvailability(member) {
      const wasRunning = this.isRunning;

      if (this.isRunning) {
        clearInterval(this.interval);
        this.isRunning = false;
      }

      if (this.spokenMembers.includes(member)) {
        this.spokenMembers = this.spokenMembers.filter((m) => m !== member);
      } else {
        this.spokenMembers.push(member);
      }

      this.updateCurrentTime();

      if (this.currentMember) {
        this.timer = this.timePerMember;
        if (wasRunning) this.toggleStopwatch();
      }
    },
    updateEndTime() {
      const now = new Date();
      const newEnd = new Date(now.getTime() + this.minutesFromNow * 60000);
      const hh = String(newEnd.getHours()).padStart(2, "0");
      const mm = String(newEnd.getMinutes()).padStart(2, "0");
      this.currentDaily.endTime = `${hh}:${mm}`;
      this.updateCurrentTime();
    },
    skipMember() {
      if (this.currentMember) {
        this.spokenMembers = this.spokenMembers.filter(member => member !== this.currentMember);
        this.nextMember();
      }
    }
  },
  mounted() {
    this.updateCurrentTime();
    setInterval(this.updateCurrentTime, 1000); // Update current time and daily time left every second
  },
  watch: {
    timer(newVal) {
      const circle = document.querySelector('.countdown-fill');
      const radius = 45;
      const circumference = 2 * Math.PI * radius;
      const percent = newVal / this.timePerMember;
      if (circle) {
        circle.style.strokeDashoffset = `${circumference * (1 - percent)}`;
      }
    }
  }

};
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  text-align: center;
  margin-top: 50px;
  width: 50vw;
  margin: auto;
}

button {
  padding: 8px 16px;
  line-height: 20px;
  font-size: 16px;
  border-radius: 24px;
  border: none;
  cursor: pointer;
}

button[primary] {
  background-color: #1b1b96;
  color: white;
}

button[primary]:hover {
  background-color: #102063;
  color: white;
}

button[secondary] {
  background-color: white;
  outline: 1px solid #1b1b96;
  color: #1b1b96;
}

button[secondary]:hover {
  background-color: #e5f0ff;
}

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

li {
  margin: 5px 0;
  justify-self: left;
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

input[type="number"] {
  outline: 1px solid #cbd2db;
  border: none;
  height: 36px;
  border-radius: 4px;
  padding: 0 12px;
}

input[type="number"]:hover {
  outline: 1px solid #000050;
}

input[type="number"]:focus {
  outline: 1px solid #1b1b96;
  box-shadow: 0px 0px 0px 3px rgba(27, 27, 150, 0.26);;
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