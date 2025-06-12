import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import InfoDaily from './InfoDaily.vue'

describe('InfoDaily.vue', () => {
    it('renders current date in pt-BR format', () => {
        // Mock Date to ensure consistent test result
        const mockDate = new Date('2023-06-15T12:00:00Z')
        global.Date = class extends Date {
            constructor() {
                super()
                return mockDate
            }
        }
        const wrapper = shallowMount(InfoDaily, {
            props: { timeLeft: 3600, currentTime: '10:00' }
        })
        expect(wrapper.text()).toMatch(/Hoje é.*15 de junho de 2023/)
        // Restore Date
        global.Date = Date
    })

    it('renders current time', () => {
        const wrapper = shallowMount(InfoDaily, {
            props: { timeLeft: 3600, currentTime: '10:00' }
        })
        expect(wrapper.text()).toContain('10:00')
    })

    it('renders end time based on timeLeft', () => {
        const wrapper = shallowMount(InfoDaily, {
            props: { timeLeft: 3600, currentTime: '10:00' }
        })
        // Should render a time string (HH:MM)
        expect(wrapper.text()).toMatch(/\d{2}:\d{2}/)
    })

    it('renders formatted timeLeft', () => {
        const wrapper = shallowMount(InfoDaily, {
            props: { timeLeft: 125, currentTime: '10:00' }
        })
        // 2 minutes and 5 seconds
        expect(wrapper.text()).toContain('02:05')
    })

    it('formats time correctly for 0 seconds', () => {
        const wrapper = shallowMount(InfoDaily, {
            props: { timeLeft: 0, currentTime: '10:00' }
        })
        expect(wrapper.vm.formatTime(0)).toBe('00:00')
    })

    it('formats time correctly for negative or NaN', () => {
        const wrapper = shallowMount(InfoDaily, {
            props: { timeLeft: -10, currentTime: '10:00' }
        })
        expect(wrapper.vm.formatTime(-10)).toBe('00:00')
        expect(wrapper.vm.formatTime(NaN)).toBe('00:00')
    })

    it('formats time correctly for single digit seconds', () => {
        const wrapper = shallowMount(InfoDaily, {
            props: { timeLeft: 8, currentTime: '10:00' }
        })
        expect(wrapper.vm.formatTime(8)).toBe('00:08')
    })

    it('matches snapshot', () => {
        const wrapper = shallowMount(InfoDaily, {
            props: { timeLeft: 90, currentTime: '09:30' }
        })
        expect(wrapper.html()).toMatchSnapshot()
    })
})