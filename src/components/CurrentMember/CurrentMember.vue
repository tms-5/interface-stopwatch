<template>
    <span class="tooltip" data-tooltip="Reiniciar a daily e zerar o cronômetro">
        <ButtonComponent type='secondary' icon="refresh" label="Reiniciar Daily" @click="resetDaily" />
    </span>
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
        <span class="tooltip" :data-tooltip="isMuted ? 'Ativar som' : 'Desativar som'">
            <ButtonComponent type='secondary' @click="toggleMute" :icon="isMuted ? 'volume_off' : 'volume_up'" />
        </span>
        <span class="tooltip" :data-tooltip="isRunning ? 'Pausar cronômetro' : 'Retomar cronômetro'">
            <ButtonComponent type='secondary' @click="toggleStopwatch" :icon="isRunning ? 'pause' : 'play_arrow'" />
        </span>
        <span class="tooltip" data-tooltip="Pular esta pessoa (redistribui o tempo e retorna ao sorteio)">
            <ButtonComponent type='secondary' @click="skipMember" icon="skip_next" />
        </span>
        <span class="tooltip" data-tooltip="Concluir e passar para a próxima (redistribui o tempo)">
            <ButtonComponent type='primary' @click="nextMember" icon="done" />
        </span>

    </div>
</template>
<script>
import ButtonComponent from '../../assets/components/button/button.vue';

export default {
    name: 'CurrentMember',
    components: {
        ButtonComponent
    },
    props: {
        currentMember: String,
        timer: Number,
        isRunning: Boolean,
        currentMemberMaxTime: Number,
        isBlinking: Boolean,
        timePerMember: Number,
        selectedSound: { type: String, default: '' },
        speakNames: { type: Boolean, default: false },
    },
    emits: ['reset-daily', 'toggle-stopwatch', 'skip-member', 'next-member'],
    data() {
        return {
            showMember: false,
            isMuted: false,
            audio: null,
            soundMap: {},

            // TTS nativo
            ttsSupported: false,
            ttsVoice: null,
        }
    },
    async mounted() {
        this.showMember = true
        setTimeout(() => (this.showMember = false), 2000)

        // estado de mute salvo
        try {
            const savedMuted = localStorage.getItem('soundMuted')
            this.isMuted = savedMuted === null ? false : savedMuted === 'true'
        } catch (e) { /* ignore */ }

        // mapa de sons
        try {
            const ctx = require.context('../../assets/sounds', false, /\.(mp3|wav|ogg)$/)
            const map = {}
            ctx.keys().forEach((key) => {
                const fileName = key.replace('./', '')
                map[fileName] = ctx(key)
            })
            this.soundMap = map
        } catch (e) { this.soundMap = {} }

        // Inicializa TTS nativo
        await this.initTTSNative()

        // se TTS indisponível, prepara áudio
        if (!this.speakNames || !this.ttsSupported) {
            this.loadAudio(this.getEffectiveSound(this.selectedSound))
        }

        // Fala a primeira pessoa imediatamente, se já houver
        if (this.speakNames && this.ttsSupported && !this.isMuted && this.currentMember) {
            // pequeno atraso para garantir que a UI montou
            setTimeout(() => this.speakNameNative(String(this.currentMember)), 0)
        }
    },
    beforeUnmount() {
    },
    watch: {
        selectedSound(newVal, oldVal) {
            if (newVal !== oldVal) {
                if (!this.speakNames || !this.ttsSupported) {
                    this.loadAudio(this.getEffectiveSound(newVal))
                }
            }
        },
        isMuted() {
            if (!this.speakNames || !this.ttsSupported) {
                this.loadAudio(this.getEffectiveSound(this.selectedSound))
            }
        },
        async speakNames(newVal) {
            if (newVal) {
                try { if (this.audio) this.audio.pause() } catch (e) { /* ignore */ }
                this.audio = null
                await this.initTTSNative()
                if (!this.ttsSupported) {
                    this.loadAudio(this.getEffectiveSound(this.selectedSound))
                }
            } else {
                this.ttsSupported = false
                this.ttsVoice = null
                this.loadAudio(this.getEffectiveSound(this.selectedSound))
            }
        },
        currentMember: {
            immediate: true,
            handler(newVal) {
                if (!newVal) return

                this.showMember = true
                setTimeout(() => (this.showMember = false), 2000)

                if (this.speakNames && this.ttsSupported && !this.isMuted) {
                    this.speakNameNative(String(newVal))
                } else if (!this.isMuted && this.audio) {
                    try {
                        this.audio.currentTime = 0
                        this.audio.play().catch(() => undefined)
                    } catch (e) { /* ignore */ }
                }
            }
        },
    },
    methods: {
        // espera as vozes do Chrome/Safari carregarem
        waitVoices() {
            return new Promise((resolve) => {
                const voices = speechSynthesis.getVoices()
                if (voices && voices.length) return resolve(voices)
                const id = setInterval(() => {
                    const v = speechSynthesis.getVoices()
                    if (v && v.length) {
                        clearInterval(id)
                        resolve(v)
                    }
                }, 100)
            })
        },

        async initTTSNative() {
            try {
                if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
                    this.ttsSupported = false
                    return
                }
                const voices = await this.waitVoices()
                this.ttsVoice =
                    voices.find(v => (v.lang || '').toLowerCase().startsWith('pt-br')) ||
                    voices.find(v => (v.lang || '').toLowerCase().startsWith('pt')) ||
                    null
                this.ttsSupported = true
            } catch (_) {
                this.ttsSupported = false
                this.ttsVoice = null
            }
        },

        speakNameNative(text) {
            try {
                if (!this.ttsSupported) return
                const u = new SpeechSynthesisUtterance(text || 'Teste de voz')
                u.lang = 'pt-BR'
                u.rate = 1; u.pitch = 1; u.volume = 1
                if (this.ttsVoice) u.voice = this.ttsVoice
                speechSynthesis.cancel()
                speechSynthesis.speak(u)
            } catch (e) { /* ignore */ }
        },

        getEffectiveSound(fileName) {
            if (this.isMuted) return ''
            if (fileName) return fileName
            const keys = Object.keys(this.soundMap || {})
            if (keys.length === 0) return ''
            if (this.soundMap['1.wav']) return '1.wav'
            if (this.soundMap['1.mp3']) return '1.mp3'
            const firstStartingWith1 = keys.find(k => /^1\./.test(k) || k === '1')
            return firstStartingWith1 || keys[0]
        },

        loadAudio(fileName) {
            try {
                if (!fileName) { this.audio = null; return }
                const resolved = this.soundMap[fileName]
                const audioUrl = resolved || `../../assets/sounds/${fileName}`
                this.audio = new Audio(audioUrl)
                this.audio.preload = 'auto'
                this.audio.volume = 0.9
            } catch (e) { this.audio = null }
        },

        // emits/controles originais
        resetDaily() { this.$emit('reset-daily') },
        toggleMute() {
            this.isMuted = !this.isMuted
            try { localStorage.setItem('soundMuted', String(this.isMuted)) } catch (e) { /* ignore */ }
        },
        toggleStopwatch() { this.$emit('toggle-stopwatch') },
        skipMember() { this.$emit('skip-member') },
        nextMember() { this.$emit('next-member') },
        formatTime(seconds) {
            const minutes = Math.floor(seconds / 60)
            const secs = seconds % 60
            return `${minutes}:${secs < 10 ? '0' : ''}${secs}`
        },
    },
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

/* Lightweight instant tooltip */
.tooltip {
    position: relative;
    display: inline-block;
}

.tooltip::after {
    content: attr(data-tooltip);
    position: absolute;
    left: 50%;
    bottom: calc(100% + 8px);
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 12px;
    line-height: 1;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.05s ease;
    z-index: 10;
}

.tooltip::before {
    content: '';
    position: absolute;
    left: 50%;
    bottom: calc(100% + 4px);
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.8);
    opacity: 0;
    transition: opacity 0.05s ease;
    z-index: 10;
}

.tooltip:hover::after,
.tooltip:hover::before {
    opacity: 1;
}
</style>