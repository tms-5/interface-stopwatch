<template>
    <button :type="'button'" v-bind="filteredAttrs" :disabled="disabled" @click="onClick">
        <slot>
            <span v-if="icon" class="material-icons">{{ icon }}</span>
            <span v-if="label">{{ label }}</span>
        </slot>
    </button>
    
</template>

<script>
export default {
    name: 'ButtonComponent',
    inheritAttrs: false,
    props: {
        label: {
            type: String,
            default: ''
        },
        icon: {
            type: String,
            default: ''
        },
        size: {
            type: String,
            default: 'medium',
            validator: value => ['small', 'medium', 'large'].includes(value)
        },
        type: {
            type: String,
            default: 'primary',
            validator: value => ['primary', 'secondary'].includes(value)
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    emits: ['click'],
    computed: {
        filteredAttrs() {
            const attrs = { ...this.$attrs };
            // Remove potential conflicting native type passed by parent (type='primary')
            if ('type' in attrs) delete attrs.type;

            // Map styling props/attrs to boolean attributes expected by CSS
            const wantPrimary = this.type === 'primary' || 'primary' in this.$attrs;
            const wantSecondary = this.type === 'secondary' || 'secondary' in this.$attrs;
            const wantSmall = this.size === 'small' || 'small' in this.$attrs;

            if (wantPrimary) attrs.primary = '';
            if (wantSecondary) attrs.secondary = '';
            if (wantSmall) attrs.small = '';

            return attrs;
        }
    },
    methods: {
        onClick(event) {
            if (this.disabled) return;
            this.$emit('click', event);
        }
    }
}
</script>
<style scoped>
button {
  display: flex;
  padding: 8px 16px;
  line-height: 20px;
  font-size: 16px;
  border-radius: 24px;
  border: none;
  cursor: pointer;
  align-items: center;
}

button[small] {
  padding: 2px 8px;
  font-size: 12px;
  line-height: 16px;
  border-radius: 12px;
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
</style>