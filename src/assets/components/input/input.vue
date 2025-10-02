<template>
  <label>
    {{ label }}
    <textarea
      v-if="textarea"
      :id="id"
      :name="name || id"
      :placeholder="placeholder"
      :value="modelValue"
      @input="updateValue"
      :readonly="readonly"
    ></textarea>
    <input
      v-else
      :id="id"
      :name="name || id"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="updateValue"
      :readonly="readonly"
    />
  </label>
</template>

<script>
export default {
  name: 'InputComponent',
  props: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    modelValue: {
      type: String,
      default: ''
    },
    readonly: {
      type: Boolean,
      default: false
    },
    textarea: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  methods: {
    updateValue(event) {
      this.$emit('update:modelValue', event.target.value);
    }
  }
}
</script>
<style scoped>
input, textarea {
    outline: 1px solid #cbd2db;
    border: none;
    border-radius: 4px;
    padding: 12px;
    font-family: inherit;
}

input {
    height: 36px;
}

textarea {
    min-height: 80px;
    resize: vertical;
}
</style>