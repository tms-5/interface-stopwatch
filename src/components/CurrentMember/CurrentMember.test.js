import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CurrentMember from './CurrentMember.vue'

describe('CurrentMember.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(CurrentMember, {
      props: {
        currentMember: 'João',
        timer: 65,
        isRunning: false,
        currentMemberMaxTime: 65,
        isBlinking: false,
        timePerMember: 65
      }
    })
  })

  it('exibe o nome do membro atual', () => {
    expect(wrapper.text()).toContain('João')
  })

  it('formata o tempo corretamente', () => {
    expect(wrapper.find('.countdown-text').text()).toBe('1:05')
  })

  it('aplica a classe blinking-red quando isBlinking é true', async () => {
    await wrapper.setProps({ isBlinking: true })
    expect(wrapper.find('.countdown-fill').classes()).toContain('blinking-red')
  })

  it('emite reset-daily ao clicar no botão Reiniciar Daily', async () => {
    await wrapper.find('button[secondary]').trigger('click')
    expect(wrapper.emitted('reset-daily')).toBeTruthy()
  })

  it('emite toggle-stopwatch ao clicar no botão de play/pause', async () => {
    // O segundo botão secondary é o play/pause
    const buttons = wrapper.findAll('button[secondary]')
    await buttons[1].trigger('click')
    expect(wrapper.emitted('toggle-stopwatch')).toBeTruthy()
  })

  it('emite skip-member ao clicar no botão de pular', async () => {
    // O terceiro botão secondary é o skip
    const buttons = wrapper.findAll('button[secondary]')
    await buttons[2].trigger('click')
    expect(wrapper.emitted('skip-member')).toBeTruthy()
  })

  it('emite next-member ao clicar no botão de próximo', async () => {
    await wrapper.find('button[primary]').trigger('click')
    expect(wrapper.emitted('next-member')).toBeTruthy()
  })

  it('mostra o overlay de zoom ao montar', async () => {
    // O overlay deve aparecer inicialmente
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.member-zoom-overlay').exists()).toBe(true)
  })

  it('esconde o overlay de zoom após 2 segundos', async () => {
    vi.useFakeTimers()
    const localWrapper = mount(CurrentMember, {
      props: {
        currentMember: 'Maria',
        timer: 10,
        isRunning: false,
        currentMemberMaxTime: 10,
        isBlinking: false,
        timePerMember: 10
      }
    })
    await localWrapper.vm.$nextTick()
    expect(localWrapper.find('.member-zoom-overlay').exists()).toBe(true)
    vi.advanceTimersByTime(2000)
    await localWrapper.vm.$nextTick()
    expect(localWrapper.find('.member-zoom-overlay').exists()).toBe(false)
    vi.useRealTimers()
  })

  it('mostra o overlay de zoom ao trocar de membro', async () => {
    vi.useFakeTimers()
    await wrapper.setProps({ currentMember: 'Lucas' })
    expect(wrapper.find('.member-zoom-overlay').exists()).toBe(true)
    vi.advanceTimersByTime(2000)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.member-zoom-overlay').exists()).toBe(false)
    vi.useRealTimers()
  })
})