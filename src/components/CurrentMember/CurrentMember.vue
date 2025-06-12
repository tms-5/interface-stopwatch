<template>

    <button secondary @click="resetDaily">Reiniciar Daily</button>
    <transition name="zoom-member">
        <div v-if="showMember" class="member-zoom-overlay">
            <div class="member-zoom-content">
                <span class="f-3 fw-600">{{ currentMember }}</span>
            </div>
        </div>
    </transition>

    <span class="f-3 fw-600">{{ currentMember }}</span>
    <div class="countdown-wrapper">
        <svg class="countdown-ring" viewBox="0 0 100 100">
            <circle class="countdown-bg" cx="50" cy="50" r="45" />
            <circle :class="{ 'blinking-red': isBlinking }" class='countdown-fill' cx="50" cy="50" r="45" />
        </svg>
        <div class="countdown-text">{{ formatTime(timer) }}</div>
    </div>
    <div class='buttons-control'>
        <button secondary @click="toggleStopwatch">
            <template v-if="isRunning">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_3296_400" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24"
                        height="24">
                        <rect width="24" height="24" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_3296_400)">
                        <path d="M14 19V5H18V19H14ZM6 19V5H10V19H6Z" fill="#1B1B96" />
                    </g>
                </svg>
            </template>
            <template v-else>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                    class="play-icon">
                    <mask id="mask0_3300_583" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24"
                        height="24">
                        <rect width="24" height="24" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_3300_583)">
                        <path
                            d="M10.5 16.3C10.3667 16.3 10.25 16.2542 10.15 16.1625C10.05 16.0708 10 15.95 10 15.8V8.20001C10 8.05001 10.05 7.92918 10.15 7.83751C10.25 7.74585 10.3667 7.70001 10.5 7.70001C10.5333 7.70001 10.65 7.75001 10.85 7.85001L14.475 11.475C14.5583 11.5583 14.6167 11.6417 14.65 11.725C14.6833 11.8083 14.7 11.9 14.7 12C14.7 12.1 14.6833 12.1917 14.65 12.275C14.6167 12.3583 14.5583 12.4417 14.475 12.525L10.85 16.15C10.8 16.2 10.7458 16.2375 10.6875 16.2625C10.6292 16.2875 10.5667 16.3 10.5 16.3Z"
                            fill="#1B1B96" />
                    </g>
                </svg>

            </template>
        </button>
        <button secondary @click="skipMember"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <mask id="mask0_3296_385" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24"
                    height="24">
                    <rect width="24" height="24" fill="#D9D9D9" />
                </mask>
                <g mask="url(#mask0_3296_385)">
                    <path
                        d="M6.0498 19L11.0498 12L6.0498 5H8.4998L13.4998 12L8.4998 19H6.0498ZM11.9998 19L16.9998 12L11.9998 5H14.4498L19.4498 12L14.4498 19H11.9998Z"
                        fill="#1B1B96" />
                </g>
            </svg>
        </button>
        <button primary @click="nextMember"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <mask id="mask0_3296_406" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24"
                    height="24">
                    <rect width="24" height="24" fill="#D9D9D9" />
                </mask>
                <g mask="url(#mask0_3296_406)">
                    <path
                        d="M9.54961 18L3.84961 12.3L5.27461 10.875L9.54961 15.15L18.7246 5.97501L20.1496 7.40001L9.54961 18Z"
                        fill="white" />
                </g>
            </svg>
        </button>
    </div>
</template>
<script>
export default {
    name: 'CurrentMember',
    props: {
        currentMember: String,
        timer: Number,
        isRunning: Boolean,
        currentMemberMaxTime: Number,
        isBlinking: Boolean,
        timePerMember: Number
    },
    emits: ['reset-daily', 'toggle-stopwatch', 'skip-member', 'next-member'],
    data() {
        return {
            showMember: false
        }
    },
    mounted() {
        this.showMember = true;
        setTimeout(() => {
            this.showMember = false;
        }, 2000);
    },
    watch: {
        currentMember(newVal) {
            if (newVal) {
                this.showMember = true;
                setTimeout(() => {
                    this.showMember = false;
                }, 2000);
            }
        },
    },
    methods: {
        resetDaily() {
            this.$emit('reset-daily');
        },
        toggleStopwatch() {
            this.$emit('toggle-stopwatch');
        },
        skipMember() {
            this.$emit('skip-member');
        },
        nextMember() {
            this.$emit('next-member');
        },
        formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
        },
    }
}
</script>
<style>
.countdown-wrapper {
    position: relative;
    width: 25vw;
    height: 25vw;
    margin: auto;
}

.countdown-ring {
    transform: rotate(-90deg);
    width: 25vw;
    height: 25vw;
}

.countdown-bg,
.countdown-fill {
    fill: none;
    stroke-width: 3;
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

.countdown-fill.blinking-red {
    stroke: rgb(114, 0, 0);
}

.countdown-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 3rem;
    font-weight: bold;
}

.member-zoom-overlay {
    position: fixed;
    z-index: 9999;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.member-zoom-content {
    background: white;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    transform: scale(1);
    transition: transform 0.5s cubic-bezier(.68, -0.55, .27, 1.55);
}

.zoom-member-enter-active {
    animation: zoomIn 1s ease forwards;
}

.zoom-member-leave-active {
    animation: zoomOut 1s ease forwards;
}


@keyframes zoomIn {
    0% {
        transform: scale(0.2);
        opacity: 0;
    }

    80% {
        transform: scale(1.8);
        opacity: 1;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes zoomOut {
    0% {
        transform: scale(1);
        opacity: 1;
    }

    100% {
        transform: scale(0.2);
        opacity: 0;
    }
}
</style>