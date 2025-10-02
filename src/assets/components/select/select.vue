<template>
    <label :for="fieldId">{{ label }}</label>
    <select :id="fieldId" :name="name || fieldId" :value="modelValue" @change="updateValue">
        <option v-for="option in options" :key="getOptionKey(option)" :value="getOptionValue(option)">
            {{ getOptionLabel(option) }}
        </option>
    </select>
</template>

<script>
export default {
    name: 'SelectComponent',
    props: {
        options: {
            type: Array,
            default: () => []
        },
        modelValue: {
            type: String,
            default: ''
        },
        label: {
            type: String,
            default: ''
        },
        name: {
            type: String,
            default: ''
        },
        selected: {
            type: String,
            default: ''
        }
    },
    emits: ['update:modelValue'],
    computed: {
        fieldId() {
            return this.name || `select-${this._uid || Math.random().toString(36).substr(2, 9)}`;
        }
    },
    methods: {
        getOptionKey(option) {
            return typeof option === 'object' && option !== null ? option.value : String(option);
        },
        getOptionValue(option) {
            return typeof option === 'object' && option !== null ? option.value : String(option);
        },
        getOptionLabel(option) {
            return typeof option === 'object' && option !== null ? option.label : String(option);
        },
        updateValue(event) {
            this.$emit('update:modelValue', event.target.value);
        }
    }
}
</script>
<style scoped>


select {
  border: none;
  outline: 1px solid #cbd2db;
  transition: outline 0.2s ease-in-out;
  box-shadow: none;
  padding: 4px 8px;
  border-radius: 4px;
}
</style>