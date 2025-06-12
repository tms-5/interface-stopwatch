<template>
    <span class="current-member">{{ teamName }}</span>
    <h3>Time</h3>
    <ul class="list-members" @dragleave="onDragLeaveRequired">
        <template v-for="(member, index) in members" :key="member">
            <!-- Placeholder ANTES do membro -->
            <li v-if="placeholderIndex === index" class="card placeholder-drop" :key="'placeholder-' + index"
                @dragover.prevent @drop.prevent="onDropToRequired(index)">
                Solte aqui para tornar obrigatório
            </li>
            <li :class="['card', { spoken: spokenMembers.includes(member) }]"
                @dragover.prevent="onDragOverRequired(index)" @drop.prevent="onDropToRequired(index)">
                <div class="cbx" :disabled="spokenMembers.includes(member)">
                    <input id="cbx" type="checkbox" :value="member" :checked="spokenMembers.includes(member)"
                        :disabled="spokenMembers.includes(member)" />
                    <label for="cbx"></label>
                    <svg width="14" height="13" viewBox="0 0 15 14" fill="none">
                        <path d="M2 8.36364L6.23077 12L13 2"></path>
                    </svg>
                </div>
                <label :for="'member-' + index">{{ member }}</label>
            </li>
        </template>
        <!-- Placeholder no final -->
        <li v-if="placeholderIndex === members.length" class="card placeholder-drop" :key="'placeholder-end'"
            @dragover.prevent @drop.prevent="onDropToRequired(members.length)">
            Solte aqui para tornar obrigatório
        </li>
    </ul>
    <div v-if="optionalMembers.length > 0" class="w-100 text-start">
        <h3>Pessoas opcionais</h3>
        <h6>Você pode arrastar membros para a lista de pessoas obrigatórias</h6>
        <ul class="list-members optional-members">
            <li v-for="(member, index) in optionalMembers" :key="'optional-' + index" draggable="true"
                @dragstart="onDragStart(member)" @dragend="onDragEnd"
                :class="['card', { spoken: spokenOptional.includes(member) || spokenMembers.includes(member) }]"
                @click="!(spokenOptional.includes(member) || spokenMembers.includes(member)) && toggleAvailability(member, members.includes(member) ? 'mandatory' : 'optional')">
                <div class="cbx" :disabled="spokenOptional.includes(member)">
                    <input id="optional-cbx" type="checkbox" :value="member"
                        :checked="spokenOptional.includes(member) || spokenMembers.includes(member)"
                        :disabled="spokenOptional.includes(member) || spokenMembers.includes(member)" />
                    <label for="optional-cbx"></label>
                    <svg width="14" height="13" viewBox="0 0 15 14" fill="none">
                        <path d="M2 8.36364L6.23077 12L13 2"></path>
                    </svg>
                </div>
                <label :for="'optional-member-' + index">{{ member }}</label>
            </li>
        </ul>
    </div>
</template>
<script>
export default {
    name: 'MemberList',
    data() {
        return {
            draggingMember: null,
            showPlaceholder: false,
            placeholderIndex: null
        }
    },
    props: {
        teamName: String,
        members: {
            type: Array,
            default: () => []
        },
        spokenMembers: {
            type: Array,
            default: () => []
        },
        optionalMembers: {
            type: Array,
            default: () => []
        },
        spokenOptional: {
            type: Array,
            default: () => []
        }
    },
    emits: ['toggle-availability', 'move-to-required'],
    methods: {
        toggleAvailability(member, type) {
            this.$emit('toggle-availability', member, type);
        },
        onDragStart(member) {
            this.draggingMember = member;
        },
        onDragEnd() {
            this.draggingMember = null;
            this.placeholderIndex = null;
        },
        onDragOverRequired(index) {
            if (this.draggingMember) {
                this.placeholderIndex = index;
            }
        },
        onDragLeaveRequired(event) {
            if (event.target === event.currentTarget) {
                this.placeholderIndex = null;
            }
        },
        onDropToRequired(index) {
            if (this.draggingMember !== null) {
                this.$emit('move-to-required', this.draggingMember, index);
                this.draggingMember = null;
                this.placeholderIndex = null;
            }
        }
    }
}
</script>
<style>
.buttons-control {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin: 20px 0;

}

.play-icon {
    g {
        transform: scale(1.5);
        transform-origin: center;
    }
}

ul.list-members {
    list-style: none;
    padding: 0;
    width: 100%;
}

.optional-members li,
.optional-members li>* {
    cursor: pointer;
}

.optional-members li[draggable="true"] {
    cursor: grab;
}

.optional-members li[draggable="true"]:active {
    cursor: grabbing;
}

li.spoken {
    color: #b7b7b7;
}

li.unavailable {
    color: gray;
    text-decoration: line-through;
}


.current-member {
    font-weight: bold;
    font-size: 2rem;
    margin-bottom: 10px;
}

@media screen and (max-width: 1000px) {
    ul {
        width: 100%;
    }
}

.list-members li {
    margin: 5px 0;
    justify-self: left;
    text-wrap-mode: nowrap;
    position: relative;
    display: flex;
    gap: 8px;
    align-items: center;
    border: 1px solid #d9d9d9;
}

:root {
    --primary: #1b1b96;
    --cbx-width: 20px;
    --cbx-border-radius: 4px;
}

.cbx input[type="checkbox"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    -webkit-tap-highlight-color: transparent;
    cursor: pointer;
    margin: 0;
}

.cbx input[type="checkbox"]:focus {
    outline: 0;
}

.cbx {
    width: var(--cbx-width);
    position: relative;
    height: var(--cbx-width);
}

.cbx[disabled="true"] {
    cursor: not-allowed;
    opacity: 0.5;

    input {

        cursor: not-allowed;
    }
}

.cbx input {
    width: var(--cbx-width);
    height: var(--cbx-width);
    border: 2px solid #353535;
    border-radius: var(--cbx-border-radius);
    transition: all 0.2s ease;
}

.cbx input:hover {
    border-color: #a6a6a6;
}

.cbx label {
    width: var(--cbx-width);
    height: var(--cbx-width);
    background: none;
    border-radius: var(--cbx-border-radius);
    position: absolute;
    top: 0;
    left: 0;
    -webkit-filter: url(#goo);
    filter: url(#goo);
    transform: translate3d(0, 0, 0);
    pointer-events: none;
}

.cbx svg {
    position: absolute;
    justify-self: anchor-center;
    z-index: 1;
    pointer-events: none;
    align-self: anchor-center;
}

.cbx svg path {
    stroke: white;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 19;
    stroke-dashoffset: 19;
    transition: all 0.4s ease;
}

.cbx input:checked+label {
    animation: splash 0.6s ease forwards;
}

.cbx input:checked+label+svg path {
    stroke-dashoffset: 0;
}

@keyframes splash {
    0% {
        transform: scale(1.1);
    }

    40% {
        transform: scale(1);
        background: var(--primary);
        box-shadow:
            0 -18px 0 -8px var(--primary),
            16px -8px 0 -8px var(--primary),
            16px 8px 0 -8px var(--primary),
            0 18px 0 -8px var(--primary),
            -16px 8px 0 -8px var(--primary),
            -16px -8px 0 -8px var(--primary);
    }

    100% {
        background: var(--primary);
        box-shadow:
            0 -32px 0 -10px transparent,
            28px -16px 0 -10px transparent,
            28px 16px 0 -10px transparent,
            0 32px 0 -10px transparent,
            -28px 16px 0 -10px transparent,
            -28px -16px 0 -10px transparent;
    }
}

.card.placeholder-drop {
    background: #e3f0ff;
    border: 1px dashed #1b1b96;
    color: #1b1b96;
    font-weight: bold;
    text-align: center;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
}
</style>