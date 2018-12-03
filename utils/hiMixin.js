export default {
  methods: {
    validator(parent, prop = [], type) {
      let value = null
      let key = type ? 'checkErrorValue' : 'checkValue'
      parent.$children.map(child => {
        if (child.prop && child[key]) {
          if (prop.length) {
            if (prop.indexOf(child.prop) !== -1) {
              if (value) {
                child[key]()
              } else {
                value = child[key]()
              }
            }
          } else {
            if (value) {
              child[key]()
            } else {
              value = child[key]()
            }
          }
        }
      })
      return value
    },
    validatorError(parent) {
      return this.validator(parent, [], true)
    },
    reset(parent) {
      parent.$children.map(child => {
        if (child.reset) {
          child.reset()
        }
      })
    },
    back() {
      this.$router.go(-1)
    }
  }
}
