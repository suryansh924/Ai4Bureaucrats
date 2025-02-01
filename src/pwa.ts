import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // Your update logic
  },
  onOfflineReady() {
    // Your offline ready logic
  },
})

export default updateSW