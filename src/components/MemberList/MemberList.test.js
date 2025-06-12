import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import MemberList from './MemberList.vue'

describe('MemberList.vue', () => {
    const baseProps = {
        teamName: 'TeamX',
        members: ['Alice', 'Bob'],
        spokenMembers: ['Alice'],
        optionalMembers: ['Carol', 'Dave'],
        spokenOptional: ['Carol']
    }

    it('renders team name and members', () => {
        const wrapper = shallowMount(MemberList, { props: baseProps })
        expect(wrapper.text()).toContain('TeamX')
        expect(wrapper.text()).toContain('Alice')
        expect(wrapper.text()).toContain('Bob')
    })

    it('renders optional members section if optionalMembers is not empty', () => {
        const wrapper = shallowMount(MemberList, { props: baseProps })
        expect(wrapper.text()).toContain('Pessoas opcionais')
        expect(wrapper.text()).toContain('Carol')
        expect(wrapper.text()).toContain('Dave')
    })

    it('does not render optional members section if optionalMembers is empty', () => {
        const wrapper = shallowMount(MemberList, {
            props: { ...baseProps, optionalMembers: [] }
        })
        expect(wrapper.text()).not.toContain('Pessoas opcionais')
    })

    it('applies spoken class to spoken members', () => {
        const wrapper = shallowMount(MemberList, { props: baseProps })
        const spokenLi = wrapper.findAll('li').find(li => li.text().includes('Alice'))
        expect(spokenLi.classes()).toContain('spoken')
    })

    it('emits toggle-availability when optional member is clicked', async () => {
        const wrapper = shallowMount(MemberList, { props: baseProps })
        const daveLi = wrapper.findAll('.optional-members li').find(li => li.text().includes('Dave'))
        await daveLi.trigger('click')
        expect(wrapper.emitted('toggle-availability')).toBeTruthy()
        expect(wrapper.emitted('toggle-availability')[0][0]).toBe('Dave')
    })

    it('emits move-to-required on drop', async () => {
        const wrapper = shallowMount(MemberList, { props: baseProps })
        // Simulate drag start
        await wrapper.vm.onDragStart('Dave')
        // Simulate drop to required at index 1
        await wrapper.vm.onDropToRequired(1)
        expect(wrapper.emitted('move-to-required')).toBeTruthy()
        expect(wrapper.emitted('move-to-required')[0]).toEqual(['Dave', 1])
    })

    it('shows placeholder when dragging over required', async () => {
        const wrapper = shallowMount(MemberList, { props: baseProps })
        await wrapper.vm.onDragStart('Dave')
        await wrapper.vm.onDragOverRequired(1)
        expect(wrapper.vm.placeholderIndex).toBe(1)
    })

    it('clears dragging state on drag end', async () => {
        const wrapper = shallowMount(MemberList, { props: baseProps })
        await wrapper.vm.onDragStart('Dave')
        await wrapper.vm.onDragEnd()
        expect(wrapper.vm.draggingMember).toBe(null)
        expect(wrapper.vm.placeholderIndex).toBe(null)
    })

    it('clears placeholder on drag leave', async () => {
        const wrapper = shallowMount(MemberList, { props: baseProps })
        await wrapper.vm.onDragStart('Dave')
        const event = { target: {}, currentTarget: {} }
        event.target = event.currentTarget
        await wrapper.vm.onDragLeaveRequired(event)
        expect(wrapper.vm.placeholderIndex).toBe(null)
    })
})