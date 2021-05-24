import head from './head'
import link from './link'
import useForm from './useForm'
import remember from './remember'
import { computed, h, markRaw, ref } from 'vue'
import { createHeadManager, Inertia } from '@inertiajs/inertia'

const component = ref(null)
const page = ref({})
const key = ref(null)

export default {
  name: 'Inertia',
  props: {
    initialPage: {
      type: Object,
      required: true,
    },
    resolveComponent: {
      type: Function,
      required: true,
    },
    resolveErrors: {
      type: Function,
      required: false,
    },
    transformProps: {
      type: Function,
      required: false,
    },
  },
  setup({ initialPage, resolveComponent, transformProps, resolveErrors }) {
    component.value = markRaw(resolveComponent(initialPage.component))
    page.value = initialPage
    key.value = null

    if (!(typeof window === 'undefined')) {
      Inertia.init({
        initialPage,
        resolveComponent,
        resolveErrors,
        transformProps,
        swapComponent: async (args) => {
          component.value = markRaw(args.component)
          page.value = args.page
          key.value = args.preserveState ? key.value : Date.now()
        },
      })
    }

    return () => {
      if (component.value) {
        if (component.value.inheritAttrs === undefined) {
          component.value.inheritAttrs = false
        }

        const child = h(component.value, {
          ...page.value.props,
          key: key.value,
        })

        if (component.value.layout) {
          if (typeof component.value.layout === 'function') {
            return component.value.layout(h, child)
          } else if (Array.isArray(component.value.layout)) {
            return component.value.layout
              .concat(child)
              .reverse()
              .reduce((child, layout) => h(layout, { ...page.value.props }, () => child))
          }

          return h(component.value.layout, { ...page.value.props }, () => child)
        }

        return child
      }
    }
  },
}

export const plugin = {
  install(app) {
    const isServer = typeof window === 'undefined'
    const headManager = createHeadManager(isServer)

    Inertia.form = useForm

    Object.defineProperty(app.config.globalProperties, '$inertia', { get: () => Inertia })
    Object.defineProperty(app.config.globalProperties, '$page', { get: () => page.value })
    Object.defineProperty(app.config.globalProperties, '$headManager', { get: () => headManager })

    if (isServer) {
      const state = { head: [] }
      Object.defineProperty(app.config.globalProperties, '$head', { get: () => state.head })
      headManager.onUpdate(elements => (state.head = elements))
    }

    app.mixin(remember)
    app.component('InertiaHead', head)
    app.component('InertiaLink', link)
  },
}

export function usePage() {
  return {
    props: computed(() => page.value.props),
    url: computed(() => page.value.url),
    component: computed(() => page.value.component),
    version: computed(() => page.value.version),
  }
}
